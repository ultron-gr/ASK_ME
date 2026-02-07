// Backend Server - Node.js + Express + Supabase
// Run: node server.js

const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
const { generateAIResponse, isAIAvailable } = require('./geminiAI');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost on any port
        if (origin.match(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Test Supabase connection
(async () => {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('✓ Supabase connected successfully');
    } catch (err) {
        console.error('✗ Supabase connection failed:', err.message);
    }
})();

// ==================== AUTHENTICATION ROUTES ====================

// Login - Using Supabase Auth
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check email domain
        if (!email.endsWith('@dsu.edu')) {
            return res.status(403).json({ message: 'Only DSU student emails are allowed' });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get user profile from users table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('full_name, is_active')
            .eq('email', email)
            .single();

        if (profileError || !userProfile) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({ message: 'Error fetching user profile' });
        }

        // Check if account is active
        if (!userProfile.is_active) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('email', email);

        // Return success with session token
        res.json({
            message: 'Login successful',
            user: {
                email: data.user.email,
                name: userProfile.full_name
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register - Using Supabase Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check email domain
        if (!email.endsWith('@dsu.edu')) {
            return res.status(403).json({ message: 'Only DSU student emails are allowed' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Create user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            console.error('Registration error:', error);
            if (error.message.includes('already registered')) {
                return res.status(409).json({ message: 'Email already registered' });
            }
            return res.status(400).json({ message: error.message });
        }

        // Insert user profile into users table
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                email,
                full_name: fullName,
                created_at: new Date().toISOString(),
                is_active: true
            }]);

        if (insertError) {
            console.error('Profile insert error:', insertError);
            // Note: Auth user is created but profile failed - might want to handle this
        }

        res.status(201).json({
            message: 'Registration successful',
            user: {
                email: data.user.email,
                name: fullName
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout - Using Supabase Auth
app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            const { error } = await supabase.auth.signOut(token);
            if (error) {
                console.error('Logout error:', error);
            }
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});

// Check session - Using Supabase Auth
app.get('/api/auth/session', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.json({ isAuthenticated: false });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.json({ isAuthenticated: false });
        }

        res.json({
            isAuthenticated: true,
            user: {
                email: user.email
            }
        });
    } catch (error) {
        console.error('Session check error:', error);
        res.json({ isAuthenticated: false });
    }
});

// ==================== MIDDLEWARE ====================

// Auth middleware for protected routes
async function requireAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// ==================== CHATBOT API ROUTES ====================

// Get free classrooms
app.get('/api/chatbot/classrooms/free', requireAuth, async (req, res) => {
    try {
        const currentTime = new Date().toISOString();
        const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

        // Query free classrooms based on schedule
        const { data, error } = await supabase
            .from('classrooms')
            .select(`
                room_number,
                building,
                capacity,
                schedules!inner(day_of_week, end_time)
            `)
            .eq('is_available', true)
            .eq('schedules.day_of_week', currentDay)
            .gte('schedules.end_time', currentTime);

        if (error) {
            console.error('Classroom query error:', error);
            return res.json({ success: false, message: 'No free classrooms found right now.' });
        }

        if (!data || data.length === 0) {
            return res.json({ success: false, message: 'All classrooms are currently occupied.' });
        }

        const formattedData = data.map(room => ({
            roomNumber: room.room_number,
            building: room.building,
            availableUntil: new Date(room.schedules.end_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }));

        res.json({
            success: true,
            message: 'Free classrooms found',
            data: formattedData
        });

    } catch (error) {
        console.error('Free classrooms error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get library status
app.get('/api/chatbot/library/status', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('library_status')
            .select('*')
            .order('last_updated', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Library query error:', error);
            return res.json({ success: false, message: 'Library data unavailable.' });
        }

        const occupancyPercentage = Math.round((data.occupied_seats / data.total_seats) * 100);
        const availableSeats = data.total_seats - data.occupied_seats;

        let message = '';
        if (occupancyPercentage >= 90) {
            message = 'Library is packed. Good luck finding a spot.';
        } else if (occupancyPercentage >= 70) {
            message = 'Library is pretty full, but you might get lucky.';
        } else if (occupancyPercentage >= 50) {
            message = 'Decent space available. Go grab a seat.';
        } else {
            message = 'Library is chill. Plenty of seats available.';
        }

        res.json({
            success: true,
            message,
            data: {
                totalSeats: data.total_seats,
                occupiedSeats: data.occupied_seats,
                availableSeats,
                occupancyPercentage
            }
        });

    } catch (error) {
        console.error('Library status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Search faculty
app.get('/api/chatbot/faculty/search', requireAuth, async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.json({
                success: false,
                message: "Give me a name to search. I'm not a mind reader."
            });
        }

        console.log('🔍 Searching faculty with name:', name);

        // Search faculty by name (case-insensitive)
        const { data, error } = await supabase
            .from('faculty')
            .select('*')
            .ilike('name', `%${name}%`);

        console.log('📊 Raw query results:', data);
        console.log('❌ Query error:', error);

        if (error) {
            console.error('Faculty query error:', error);
            return res.json({ success: false, message: 'Faculty search failed: ' + error.message });
        }

        if (!data || data.length === 0) {
            return res.json({
                success: false,
                message: `No faculty found matching "${name}". Try a different name or check your spelling.`
            });
        }

        // Remove duplicates by faculty_id
        const uniqueFaculty = Array.from(
            new Map(data.map(f => [f.faculty_id, f])).values()
        );

        console.log('✅ Unique results:', uniqueFaculty.length);

        if (uniqueFaculty.length > 1) {
            const formattedData = uniqueFaculty.map(f => ({
                name: f.name,
                cabin: f.cabin_number,
                department: f.department,
                status: f.is_available ? 'Available' : 'Busy'
            }));

            return res.json({
                success: true,
                multiple: true,
                message: `Found ${uniqueFaculty.length} faculty members matching "${name}":`,
                data: formattedData
            });
        }

        const faculty = uniqueFaculty[0];
        res.json({
            success: true,
            multiple: false,
            message: faculty.is_available ? 'Faculty is currently available.' : 'Faculty might be in a class or meeting.',
            data: {
                name: faculty.name,
                cabin: faculty.cabin_number,
                department: faculty.department,
                email: faculty.email,
                status: faculty.is_available ? 'Available' : 'Busy'
            }
        });

    } catch (error) {
        console.error('Faculty search error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== AI CHAT ENDPOINT ====================

app.post('/api/chat/ai', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Check if AI is available
        if (!isAIAvailable()) {
            return res.json({
                success: false,
                message: "AI is not configured. Ask me about classrooms, library, or faculty instead!",
                aiAvailable: false
            });
        }

        // Generate AI response
        const aiResponse = await generateAIResponse(message);

        res.json({
            success: true,
            response: aiResponse,
            aiAvailable: true
        });

    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI response',
            aiAvailable: isAIAvailable()
        });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        aiAvailable: isAIAvailable()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});

module.exports = app;

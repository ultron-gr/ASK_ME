// Chatbot Logic with Gen-Z Personality and Intent Detection using Supabase

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Check authentication and restore session
async function checkAuth() {
    const accessToken = sessionStorage.getItem('access_token');
    const refreshToken = sessionStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
        window.location.href = 'login.html';
        return false;
    }

    try {
        // Restore the session in Supabase client
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        if (error || !data.session) {
            console.error('Session restore error:', error);
            sessionStorage.clear();
            window.location.href = 'login.html';
            return false;
        }

        console.log('✅ Session restored successfully');
        console.log('User:', data.session.user.email);

        // Test database connection
        await testDatabaseConnection();

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        sessionStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
}

// Test database connection and RLS policies
async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    try {
        // Test faculty table - try to get actual data
        const { data: facultyData, error: facultyError } = await supabase
            .from('faculty')
            .select('*');

        if (facultyError) {
            console.error('❌ Faculty table error:', facultyError);
            console.error('This usually means RLS policies are blocking access');
            console.error('👉 You need to run: backend/fix-rls-policies.sql in Supabase SQL Editor');
        } else {
            console.log('✅ Faculty table accessible');
            console.log(`   Found ${facultyData.length} faculty members:`);
            if (facultyData.length > 0) {
                facultyData.forEach(f => console.log(`   - ${f.name} (${f.cabin_number})`));
            } else {
                console.warn('⚠️ No faculty data in database! Run backend/database-setup.sql');
            }
        }

        // Test classrooms table
        const { data: classroomData, error: classroomError } = await supabase
            .from('classrooms')
            .select('count');

        if (classroomError) {
            console.error('❌ Classrooms table error:', classroomError);
        } else {
            console.log('✅ Classrooms table accessible');
        }

        // Test library_status table
        const { data: libraryData, error: libraryError } = await supabase
            .from('library_status')
            .select('count');

        if (libraryError) {
            console.error('❌ Library table error:', libraryError);
        } else {
            console.log('✅ Library table accessible');
        }

    } catch (error) {
        console.error('❌ Database connection test failed:', error);
    }
}

checkAuth();

// Intent Detection - Improved with better keyword matching
function detectIntent(message) {
    const msg = message.toLowerCase().trim();

    // Free Classroom Intent
    const classroomKeywords = [
        'free class', 'empty room', 'classroom free', 'empty class',
        'free room', 'available room', 'available class', 'where can i sit',
        'where to study', 'free space', 'any room', 'vacant room',
        'show me rooms', 'find room', 'which room', 'study room',
        'class available', 'rooms free', 'empty classroom'
    ];

    // Library Intent
    const libraryKeywords = [
        'library', 'lib', 'seats', 'seat available', 'library full',
        'library empty', 'study in library', 'library occupancy',
        'library status', 'how many seats', 'library busy', 'library free',
        'can i study', 'library open', 'seats left'
    ];

    // Faculty Intent - More comprehensive
    const facultyKeywords = [
        'teacher', 'professor', 'faculty', 'sir', 'mam', 'madam',
        'dr.', 'dr ', 'cabin', 'where is', 'find teacher', 'contact',
        'prof', 'sharma', 'patel', 'kumar', 'singh', 'desai',
        'verma', 'mehta', 'nair', 'reddy', 'gupta',
        'find prof', 'locate', 'office', 'faculty location'
    ];

    if (classroomKeywords.some(kw => msg.includes(kw))) {
        return 'classroom';
    }

    if (libraryKeywords.some(kw => msg.includes(kw))) {
        return 'library';
    }

    if (facultyKeywords.some(kw => msg.includes(kw))) {
        return 'faculty';
    }

    return 'unknown';
}

// API Calls using Supabase
async function handleClassroomQuery() {
    try {
        console.log('🏫 Fetching free classrooms via backend API');

        const accessToken = sessionStorage.getItem('access_token');

        const response = await fetch('http://localhost:3001/api/chatbot/classrooms/free', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('📊 Backend API response:', result);

        if (!result.success) {
            return result.message || "No free classrooms found right now.";
        }

        const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        let responseText = `**Free Classrooms Right Now (${currentDay}):**\n\n`;

        result.data.forEach(room => {
            responseText += `• **${room.roomNumber}** (${room.building}) - free till ${room.availableUntil}\n`;
        });

        return responseText;

    } catch (error) {
        console.error('❌ Classroom query error:', error);
        return "Can't reach the backend server. Make sure it's running on port 3001.\n\nError: " + error.message;
    }
}

async function handleLibraryQuery() {
    try {
        console.log('📚 Fetching library status via backend API');

        const accessToken = sessionStorage.getItem('access_token');

        const response = await fetch('http://localhost:3001/api/chatbot/library/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('📊 Backend API response:', result);

        if (!result.success) {
            return result.message || "Library data unavailable right now.";
        }

        const data = result.data;
        let responseText = `**Library Status:**\n\n`;
        responseText += `Total Seats: ${data.totalSeats}\n`;
        responseText += `Available: ${data.availableSeats}\n`;
        responseText += `Occupancy: ${data.occupancyPercentage}%\n\n`;
        responseText += result.message;

        return responseText;

    } catch (error) {
        console.error('❌ Library query error:', error);
        return "Can't reach the backend server. Make sure it's running on port 3001.\n\nError: " + error.message;
    }
}

async function handleFacultyQuery(message) {
    try {
        // Improved name extraction - keep actual name parts
        let searchName = message.toLowerCase()
            .replace(/where is|find|locate|search|show me|tell me about|contact|who is/gi, '')
            .replace(/teacher|professor|faculty|sir|mam|madam|mr|mrs|ms/gi, '')
            .replace(/prof\.?|prof\s/gi, '')
            .replace(/dr\.?\s*/gi, '') // Remove "Dr." but keep the name
            .replace(/\?/g, '')
            .trim();

        // Clean up extra spaces
        searchName = searchName.replace(/\s+/g, ' ').trim();

        // If no name found, try to extract any word that looks like a name (capitalized or longer words)
        if (!searchName || searchName.length < 2) {
            const words = message.split(' ').filter(word => word.length > 0);
            const possibleName = words.find(word => {
                const w = word.toLowerCase().replace(/[^a-z]/g, '');
                return w.length > 3 &&
                    !['where', 'find', 'show', 'tell', 'about', 'teacher', 'professor', 'faculty'].includes(w);
            });
            searchName = possibleName ? possibleName.replace(/[^a-zA-Z\s]/g, '') : '';
        }

        if (!searchName || searchName.length < 2) {
            return "Give me a faculty name to search. Try: 'Where is Dr. Sharma?' or 'Find Professor Patel' or just 'Sharma'";
        }

        console.log('🔍 Searching for faculty via backend API:', searchName);

        // Get access token for authentication
        const accessToken = sessionStorage.getItem('access_token');

        // Call backend API instead of direct Supabase query
        const response = await fetch(`http://localhost:3001/api/chatbot/faculty/search?name=${encodeURIComponent(searchName)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('📊 Backend API response:', result);

        if (!result.success) {
            return result.message || "Faculty search failed. Try a different name.";
        }

        // Handle multiple results
        if (result.multiple && result.data && result.data.length > 1) {
            let responseText = `**Found ${result.data.length} faculty members:**\n\n`;
            result.data.forEach(faculty => {
                responseText += `• **${faculty.name}**\n  Cabin: ${faculty.cabin} | ${faculty.department}\n\n`;
            });
            return responseText;
        }

        // Handle single result
        const faculty = result.data;
        const statusIcon = faculty.status === 'Available' ? '✅' : '❌';

        let responseText = `**${faculty.name}**\n\n`;
        responseText += `📍 Cabin: ${faculty.cabin}\n`;
        responseText += `🏛️ Department: ${faculty.department}\n`;
        responseText += `📊 Status: ${statusIcon} ${faculty.status}\n`;

        if (faculty.email) {
            responseText += `📧 Email: ${faculty.email}\n`;
        }

        responseText += `\n${faculty.status === 'Available' ? '✨ Faculty is available right now!' : '⏰ Faculty might be in class or a meeting. Try later!'}`;
        return responseText;

    } catch (error) {
        console.error('❌ Faculty search error:', error);
        return "Can't reach the backend server. Make sure it's running on port 3001.\n\nError: " + error.message;
    }
}

// AI-powered response for general questions
async function handleAIQuery(message) {
    try {
        const response = await fetch('http://localhost:3000/api/chat/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.success && data.response) {
            return `🤖 **AI Assistant:**\n\n${data.response}`;
        }

        // If AI is not available, return default message
        return "I help with campus stuff: free classrooms, library status, and faculty locations. Ask me something specific!";

    } catch (error) {
        console.error('AI query error:', error);
        return "I help with campus stuff: free classrooms, library status, and faculty locations. Ask me something specific!";
    }
}

// Process user query
async function processQuery(message) {
    const intent = detectIntent(message);

    switch(intent) {
        case 'classroom':
            return await handleClassroomQuery();

        case 'library':
            return await handleLibraryQuery();

        case 'faculty':
            return await handleFacultyQuery(message);

        default:
            // Use AI for unknown queries
            return await handleAIQuery(message);
    }
}

// UI Functions
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Convert markdown-style formatting to HTML
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    contentDiv.innerHTML = `<p>${formattedText}</p>`;
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.appendChild(indicator);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    userInput.value = '';

    // Disable input while processing
    sendBtn.disabled = true;
    userInput.disabled = true;

    // Show typing indicator
    showTypingIndicator();

    try {
        // Process query
        const response = await processQuery(message);

        // Remove typing indicator
        removeTypingIndicator();

        // Add bot response
        addMessage(response, false);
    } catch (error) {
        removeTypingIndicator();
        addMessage("Oops. Something broke on my end. Try again?", false);
        console.error('Error:', error);
    } finally {
        // Re-enable input
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
});

// Auto-focus input on load
userInput.focus();

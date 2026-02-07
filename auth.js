// Frontend Authentication Logic with Supabase

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Initialize Supabase client (make sure supabaseClient.js is loaded first)
// The supabase client is initialized in supabaseClient.js

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validate email domain
        if (!email.endsWith('@dsu.edu.in')) {
            showError('Please use your DSU student email');
            return;
        }

        // Clear previous errors
        hideError();

        // Disable form while processing
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            // Sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                showError(error.message || 'Invalid credentials');
                return;
            }

            // Store session data
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('access_token', data.session.access_token);
            sessionStorage.setItem('refresh_token', data.session.refresh_token);

            // Get user profile to get full name
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('full_name')
                .eq('email', email)
                .single();

            if (!profileError && profile) {
                sessionStorage.setItem('userName', profile.full_name);
            } else {
                sessionStorage.setItem('userName', email.split('@')[0]);
            }

            // Redirect to dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
        } finally {
            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate email domain
        if (!email.endsWith('@dsu.edu.in')) {
            showError('Please use your DSU email (@dsu.edu.in)');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        // Clear previous messages
        hideError();
        hideSuccess();

        // Disable form while processing
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        try {
            // Sign up with Supabase
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
                if (error.message.includes('already registered')) {
                    showError('Email already registered');
                } else {
                    showError(error.message || 'Registration failed');
                }
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
                return;
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
            }

            // Registration successful
            showSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            showError('Connection error. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}

// Helper functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
    }
}

function showSuccess(message) {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
    }
}

function hideSuccess() {
    if (successMessage) {
        successMessage.textContent = '';
        successMessage.classList.remove('show');
    }
}

// Check if already logged in
async function checkExistingSession() {
    const accessToken = sessionStorage.getItem('access_token');

    if (accessToken) {
        try {
            const { data: { user }, error } = await supabase.auth.getUser(accessToken);

            if (!error && user) {
                // Valid session, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Invalid session, clear storage
                sessionStorage.clear();
            }
        } catch (error) {
            console.error('Session check error:', error);
            sessionStorage.clear();
        }
    }
}

// Run on page load
checkExistingSession();

// Dashboard Logic

// Avatar mapping
const avatars = [
    { id: 'avatar-1', emoji: '🐢', name: 'Chrono Tortoise' },
    { id: 'avatar-2', emoji: '🦅', name: 'Stratos Eagle' },
    { id: 'avatar-3', emoji: '🐻', name: 'Titan Bear' },
    { id: 'avatar-4', emoji: '🦊', name: 'Echo Fox' },
    { id: 'avatar-5', emoji: '🐯', name: 'Blaze Tiger' },
    { id: 'avatar-6', emoji: '🐺', name: 'Vortex Wolf' },
    { id: 'avatar-7', emoji: '🦉', name: 'Aegis Owl' }
];

let currentUserEmail = '';

// Check authentication
async function checkAuth() {
    const accessToken = sessionStorage.getItem('access_token');
    const refreshToken = sessionStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
        window.location.href = 'login.html';
        return false;
    }

    try {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        if (error || !data.session) {
            sessionStorage.clear();
            window.location.href = 'login.html';
            return false;
        }

        currentUserEmail = data.session.user.email;
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        sessionStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', currentUserEmail)
            .single();

        if (error) {
            console.error('Profile load error:', error);
            // Use fallback data from session storage
            displayFallbackProfile();
            return;
        }

        if (data) {
            // Get avatar info
            const avatarId = data.avatar || 'avatar-1';
            const avatar = avatars.find(a => a.id === avatarId) || avatars[0];

            // Update avatar display - try PNG first, fall back to emoji
            const imgPath = `assets/avatars/${avatarId}.png`;
            document.getElementById('userAvatar').innerHTML = `
                <span class="avatar-icon">
                    <img src="${imgPath}" alt="${avatar.name}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    <span style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4.5rem;">${avatar.emoji}</span>
                </span>
            `;

            // Update welcome text
            document.getElementById('userName').textContent = data.full_name || data.email.split('@')[0];

            // Update bio or default message
            if (data.bio && data.bio.trim()) {
                document.getElementById('userBio').textContent = data.bio;
            } else {
                document.getElementById('userBio').textContent = 'Ready to explore campus?';
            }

            // Update badge with avatar name
            document.getElementById('userBadge').textContent = avatar.name;

            // Update email
            document.getElementById('userEmail').textContent = data.email;

            // Update branch and year if available
            if (data.branch) {
                document.getElementById('userBranch').textContent = data.branch;
                document.getElementById('branchInfo').style.display = 'flex';
            }

            if (data.year) {
                document.getElementById('userYear').textContent = data.year;
                document.getElementById('yearInfo').style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Profile load error:', error);
        displayFallbackProfile();
    }
}

// Display fallback profile from session
function displayFallbackProfile() {
    const userName = sessionStorage.getItem('userName') || currentUserEmail.split('@')[0];
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = currentUserEmail;
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }

    sessionStorage.clear();
    window.location.href = 'login.html';
});

// Initialize on page load
(async () => {
    if (await checkAuth()) {
        await loadUserProfile();
    }
})();

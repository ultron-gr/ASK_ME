// Profile Management Logic

// Available avatars with themed names
const avatars = [
    { id: 'avatar-1', emoji: '🐢', alt: 'Chrono Tortoise' },
    { id: 'avatar-2', emoji: '🦅', alt: 'Stratos Eagle' },
    { id: 'avatar-3', emoji: '🐻', alt: 'Titan Bear' },
    { id: 'avatar-4', emoji: '🦊', alt: 'Echo Fox' },
    { id: 'avatar-5', emoji: '🐯', alt: 'Blaze Tiger' },
    { id: 'avatar-6', emoji: '🐺', alt: 'Vortex Wolf' },
    { id: 'avatar-7', emoji: '🦉', alt: 'Aegis Owl' }
];

let selectedAvatar = 'avatar-1';
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
async function loadProfile() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', currentUserEmail)
            .single();

        if (error) {
            console.error('Profile load error:', error);
            showError('Failed to load profile');
            return;
        }

        if (data) {
            // Populate form fields
            document.getElementById('fullName').value = data.full_name || '';
            document.getElementById('username').value = data.username || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('bio').value = data.bio || '';
            document.getElementById('branch').value = data.branch || '';
            document.getElementById('year').value = data.year || '';

            // Set character count
            updateCharCount();

            // Set selected avatar
            selectedAvatar = data.avatar || 'avatar-1';
            updateCurrentAvatar(selectedAvatar);
        }
    } catch (error) {
        console.error('Profile load error:', error);
        showError('Failed to load profile');
    }
}

// Populate avatar grid
function populateAvatarGrid() {
    const avatarGrid = document.getElementById('avatarGrid');
    avatarGrid.innerHTML = '';

    avatars.forEach(avatar => {
        const avatarOption = document.createElement('div');
        avatarOption.className = 'avatar-option';
        avatarOption.dataset.avatar = avatar.id;

        // Try to use PNG image, fall back to emoji
        const imgPath = `assets/avatars/${avatar.id}.png`;

        avatarOption.innerHTML = `
            <div class="avatar-icon">
                <img src="${imgPath}" alt="${avatar.alt}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                <span style="display: none;">${avatar.emoji}</span>
            </div>
            <p>${avatar.alt}</p>
        `;

        avatarOption.addEventListener('click', () => {
            selectAvatar(avatar.id);
        });

        avatarGrid.appendChild(avatarOption);
    });
}

// Select avatar
function selectAvatar(avatarId) {
    selectedAvatar = avatarId;

    // Update UI
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`[data-avatar="${avatarId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }

    updateCurrentAvatar(avatarId);
}

// Update current avatar display
function updateCurrentAvatar(avatarId) {
    const avatar = avatars.find(a => a.id === avatarId);
    if (avatar) {
        const currentAvatar = document.getElementById('currentAvatar');
        const imgPath = `assets/avatars/${avatarId}.png`;

        currentAvatar.innerHTML = `
            <span class="avatar-icon">
                <img src="${imgPath}" alt="${avatar.alt}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                <span style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4rem;">${avatar.emoji}</span>
            </span>
        `;
    }

    // Mark as selected in grid
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`[data-avatar="${avatarId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

// Update character count
function updateCharCount() {
    const bioInput = document.getElementById('bio');
    const charCount = document.getElementById('bioCount');
    charCount.textContent = bioInput.value.length;
}

// Save profile
async function saveProfile(formData) {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                full_name: formData.fullName,
                username: formData.username,
                bio: formData.bio,
                branch: formData.branch,
                year: formData.year,
                avatar: selectedAvatar
            })
            .eq('email', currentUserEmail);

        if (error) {
            if (error.message.includes('unique')) {
                showError('Username already taken. Please choose another.');
            } else {
                showError('Failed to save profile: ' + error.message);
            }
            return false;
        }

        showSuccess('Profile updated successfully!');

        // Update session storage
        sessionStorage.setItem('userName', formData.fullName);

        return true;
    } catch (error) {
        console.error('Save profile error:', error);
        showError('Failed to save profile');
        return false;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');

    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.classList.add('show');

    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 3000);
}

// Handle form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        username: document.getElementById('username').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        branch: document.getElementById('branch').value,
        year: document.getElementById('year').value
    };

    // Validation
    if (!formData.fullName) {
        showError('Full name is required');
        return;
    }

    if (!formData.username) {
        showError('Username is required');
        return;
    }

    if (formData.username.length < 3) {
        showError('Username must be at least 3 characters');
        return;
    }

    if (!formData.branch) {
        showError('Please select your branch');
        return;
    }

    // Disable form while saving
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const success = await saveProfile(formData);

    // Re-enable form
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Profile';
});

// Handle cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
    window.location.href = 'chatbot.html';
});

// Bio character counter
document.getElementById('bio').addEventListener('input', updateCharCount);

// Logout button
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
        populateAvatarGrid();
        await loadProfile();
    }
})();

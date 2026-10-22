const BACKEND_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    // Text Search Functionality + History Save
    async function performTextSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const category = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

        if (query === "") {
            alert("Please enter a product name or link to search!");
            return;
        }

        const savedUser = localStorage.getItem('shoppingAppUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            try {
                await fetch(`${BACKEND_URL}/history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, query: query })
                });
                
                if (!user.history.includes(query)) {
                    user.history.unshift(query);
                    localStorage.setItem('shoppingAppUser', JSON.stringify(user));
                }
            } catch(e) { console.log("History save error:", e) }
        }

        window.location.href = `results.html?query=${encodeURIComponent(query)}&category=${category}`;
    }

    if (searchBtn) searchBtn.addEventListener('click', performTextSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performTextSearch();
        });
    }

    // Modal Controls
    const optionModal = document.getElementById('optionModal');
    const cameraTrigger = document.getElementById('cameraModalTrigger');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (cameraTrigger) cameraTrigger.addEventListener('click', () => optionModal.classList.add('show'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => optionModal.classList.remove('show'));

    // File Upload
    const galleryInput = document.getElementById('galleryInput');
    const cameraInput = document.getElementById('cameraInput');

    async function handleFileUpload(file) {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${BACKEND_URL}/search/image`, { method: 'POST', body: formData });
            const data = await response.json();

            if (optionModal) optionModal.classList.remove('show');

            if (data.success && data.products.length > 0) {
                sessionStorage.setItem('imageSearchResult', JSON.stringify(data));
                window.location.href = `results.html?type=image`;
            } else {
                alert("No matching products found for this image!");
            }
        } catch (err) {
            alert("Server error during upload!");
        }
    }

    if (galleryInput) galleryInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));
    if (cameraInput) cameraInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

    // Store Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const storeCards = document.querySelectorAll('.store-card');

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            storeCards.forEach((card) => {
                if (filterValue === 'all' || card.classList.contains(filterValue)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // AUTHENTICATION, PROFILE & LOGOUT LOGIC
    // ==========================================
    const navAuthBtn = document.getElementById('navAuthBtn');
    const authModalUI = document.getElementById('authModalUI');
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    
    // Tabs
    const showLoginTab = document.getElementById('showLoginTab');
    const showSignupTab = document.getElementById('showSignupTab');
    const loginFormArea = document.getElementById('loginFormArea');
    const signupFormArea = document.getElementById('signupFormArea');

    // Profile Elements
    const userProfileArea = document.getElementById('userProfileArea');
    const navProfilePic = document.getElementById('navProfilePic');
    const profileDropdown = document.getElementById('profileDropdown');
    const historyList = document.getElementById('historyList');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserDetails = document.getElementById('dropdownUserDetails');

    // Automatic Login Modal Trigger if redirected with ?openAuth=true or #login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAuth') === 'true' || window.location.hash === '#login') {
        if (authModalUI) {
            authModalUI.classList.add('show');
        }
    }

    // Tab Switching Logic
    if(showLoginTab && showSignupTab) {
        showLoginTab.addEventListener('click', () => {
            loginFormArea.style.display = 'block';
            signupFormArea.style.display = 'none';
            showLoginTab.style.background = '#ff9900';
            showLoginTab.style.color = '#000';
            showSignupTab.style.background = 'transparent';
            showSignupTab.style.color = '#94a3b8';
        });

        showSignupTab.addEventListener('click', () => {
            loginFormArea.style.display = 'none';
            signupFormArea.style.display = 'block';
            showSignupTab.style.background = '#ff9900';
            showSignupTab.style.color = '#000';
            showLoginTab.style.background = 'transparent';
            showLoginTab.style.color = '#94a3b8';
        });
    }

    // Check Login State & Populate User Profile Dropdown Card
    function checkLoginState() {
        const savedUser = localStorage.getItem('shoppingAppUser');
        if (savedUser && navAuthBtn && userProfileArea) {
            const user = JSON.parse(savedUser);
            navAuthBtn.style.display = 'none';
            userProfileArea.style.display = 'flex';
            
            if (navProfilePic) navProfilePic.src = user.pic;
            
            const dropdownProfilePic = document.getElementById('dropdownProfilePic');
            if (dropdownProfilePic) dropdownProfilePic.src = user.pic;
            
            if (dropdownUserName) dropdownUserName.textContent = `Hi, ${user.name}`;
            if (dropdownUserDetails) {
                dropdownUserDetails.innerHTML = `Phone: ${user.phone || 'N/A'} <br> Age: ${user.age || 'N/A'} Yrs`;
            }
            
            if (user.history && user.history.length > 0 && historyList) {
                historyList.innerHTML = user.history.map(item => `<li style="margin-bottom: 5px;">${item}</li>`).join('');
            }
        }
    }
    checkLoginState();

    // Toggle Profile Dropdown Card & Handle Outside Click
    if (navProfilePic) {
        navProfilePic.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.style.display = (profileDropdown.style.display === 'none' || profileDropdown.style.display === '') ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (profileDropdown && userProfileArea && !userProfileArea.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Open/Close Auth Modal
    if(navAuthBtn) navAuthBtn.addEventListener('click', (e) => { e.preventDefault(); authModalUI.classList.add('show'); });
    if(closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => authModalUI.classList.remove('show'));

    // Password Strength Detection
    function checkPasswordStrength(password) {
        if (!password || password.length < 6) {
            return { level: 'short', text: 'Password must be at least 6 characters long ❌', color: '#ef4444' };
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 1) {
            return { level: 'easy', text: 'Password Strength: Easy (Weak) ⚠️', color: '#ef4444' };
        } else if (score === 2 || score === 3) {
            return { level: 'medium', text: 'Password Strength: Medium 📈', color: '#f59e0b' };
        } else {
            return { level: 'strong', text: 'Password Strength: Strong 💪', color: '#22c55e' };
        }
    }

    // Real-Time Password Listener
    const regPasswordInput = document.getElementById('regPassword');
    const passwordStrengthIndicator = document.getElementById('passwordStrengthIndicator');

    if (regPasswordInput && passwordStrengthIndicator) {
        regPasswordInput.addEventListener('input', () => {
            const val = regPasswordInput.value;
            if (!val) {
                passwordStrengthIndicator.style.display = 'none';
                return;
            }
            passwordStrengthIndicator.style.display = 'block';
            const result = checkPasswordStrength(val);
            passwordStrengthIndicator.textContent = result.text;
            passwordStrengthIndicator.style.color = result.color;
        });
    }

    // SEND OTP Action (Unhides OTP Field On Success)
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const regOtpInput = document.getElementById('regOtp');

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const email = document.getElementById('regEmail').value.trim();
            if (!email) return alert("Please enter your email address first!");

            try {
                sendOtpBtn.textContent = "Sending...";
                const response = await fetch(`${BACKEND_URL}/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                sendOtpBtn.textContent = "Resend";

                if (data.success) {
                    alert(data.message);
                    // Make OTP Input Visible
                    if (regOtpInput) {
                        regOtpInput.style.display = 'block';
                        regOtpInput.focus();
                    }
                } else {
                    alert(data.message);
                }
            } catch (err) {
                sendOtpBtn.textContent = "Get OTP";
                alert("Server connection failed!");
            }
        });
    }

    // SIGN UP Action
    const submitSignupAction = document.getElementById('submitSignupAction');
    if (submitSignupAction) {
        submitSignupAction.addEventListener('click', async () => {
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const otp = regOtpInput ? regOtpInput.value.trim() : '';
            const phone = document.getElementById('regPhone').value.trim();
            const dob = document.getElementById('regDob').value;
            const password = document.getElementById('regPassword').value;
            const picFile = document.getElementById('regPic').files[0];

            if (!name || !email || !otp || !password || !dob) {
                return alert("Name, Email, OTP, Birth Date and Password are required!");
            }

            if (password.length < 6) {
                return alert("Password at least 6 characters or numbers diye toiri korte hobe!");
            }

            const strengthObj = checkPasswordStrength(password);
            if (strengthObj.level === 'easy') {
                const proceed = confirm("⚠️ Ei password-ta khub EASY (Weak)! Apni ki erporo ei password-ti rakhben, naki change korben?");
                if (!proceed) return; 
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('otp', otp);
            formData.append('phone', phone);
            formData.append('dob', dob);
            formData.append('password', password);
            if (picFile) {
                formData.append('profilePic', picFile);
            }

            try {
                submitSignupAction.textContent = "Verifying...";
                const response = await fetch(`${BACKEND_URL}/signup`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                submitSignupAction.textContent = "Verify & Create Account";

                if (data.success) {
                    alert(data.message);
                    localStorage.setItem('shoppingAppUser', JSON.stringify(data.user));
                    
                    authModalUI.classList.remove('show');
                    checkLoginState();
                    // Clean URL redirect to stop auto-opening login modal
                    window.location.href = 'front_page.html'; 
                } else {
                    alert(data.message);
                }
            } catch(err) { 
                submitSignupAction.textContent = "Verify & Create Account";
                alert("Server error during sign up!"); 
            }
        });
    }

    // LOGIN Action
    const submitLoginAction = document.getElementById('submitLoginAction');
    if (submitLoginAction) {
        submitLoginAction.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) return alert("Please enter email and password.");

            try {
                const response = await fetch(`${BACKEND_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('shoppingAppUser', JSON.stringify(data.user));
                    
                    authModalUI.classList.remove('show');
                    checkLoginState();
                    window.location.href = 'front_page.html'; 
                } else alert(data.message);
            } catch(err) { alert("Server error!"); }
        });
    }

    // LOGOUT Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const savedUser = JSON.parse(localStorage.getItem('shoppingAppUser'));
            if(confirm("Logging out will permanently delete your data from the database. Continue?")) {
                if (savedUser && savedUser.email) {
                    await fetch(`${BACKEND_URL}/logout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: savedUser.email })
                    });
                }
                localStorage.removeItem('shoppingAppUser');
                location.reload();
            }
        });
    }

    // STORE DIRECT REDIRECTION LOGIC
    const storeLinks = {
        "Amazon": "https://www.amazon.in",
        "Flipkart": "https://www.flipkart.com",
        "Myntra": "https://www.myntra.com",
        "AJIO": "https://www.ajio.com",
        "Nykaa": "https://www.nykaa.com",
        "Reliance": "https://www.reliancedigital.in",
        "Reliance Digital": "https://www.reliancedigital.in",
        "Purplle": "https://www.purplle.com",
        "Meesho": "https://www.meesho.com",
        "Croma": "https://www.croma.com",
        "H & M": "https://www2.hm.com/en_in/index.html"
    };

    const allAppCards = document.querySelectorAll('.brand-card, .store-card');

    allAppCards.forEach(card => {
        card.addEventListener('click', () => {
            const storeName = card.getAttribute('data-store');
            if (storeLinks[storeName]) {
                window.open(storeLinks[storeName], '_blank');
            }
        });
    });
});
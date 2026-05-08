document.addEventListener('DOMContentLoaded', () => {

    // --- Dark Mode Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const themeText = themeToggleBtn.querySelector('span');

    // Function to update UI based on theme
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeText.innerText = 'Light Mode';
            localStorage.setItem('appTheme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeText.innerText = 'Dark Mode';
            localStorage.setItem('appTheme', 'light');
        }
    }

    // 1. Check LocalStorage on initial load
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    }

    // 2. Click Event Listener
    // 2. Click Event Listener for Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            applyTheme(!isCurrentlyDark); // Toggle theme

            // Close sidebar on mobile after switching theme
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('mobile-open');
            }
        });
    }


    const navItems = document.querySelectorAll('.nav-item[data-nav]');
    const viewSections = document.querySelectorAll('.view-section');
    const toolCards = document.querySelectorAll('.tool-card'); // Naya add kiya hai

    // Core routing logic function (Updated for History API)
    function switchView(targetViewId, updateHistory = true) {
        // 1. Reset all active states in sidebar
        navItems.forEach(nav => nav.classList.remove('active'));

        // 2. Find the matching sidebar link and make it active
        const activeNav = document.querySelector(`.nav-item[data-nav="${targetViewId}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // 3. Hide all sections properly
        viewSections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden'); // Hidden class zaroori hai
        });

        // 4. Show the requested section
        const targetSection = document.getElementById(targetViewId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }

        // 5. Update Browser History Stack (Back Button Magic)
        if (updateHistory) {
            window.history.pushState({ viewId: targetViewId }, '', `#${targetViewId}`);
        }
    }

    // Sidebar pe click event (Updated)
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const targetViewId = this.getAttribute('data-nav');

            switchView(targetViewId); // History update ke sath call

            // Auto-close sidebar on mobile
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('mobile-open');
            }
        });
    });

    // Intercept Mobile/System Back Button
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.viewId) {
            // Agar history me state hai, to updateHistory parameter ko false rakho loop se bachne ke liye
            switchView(e.state.viewId, false);
        } else {
            // Default load hone par wapas home (dashboard) par bhejo
            switchView('dashboard', false);
        }
    });

    // App load hote hi default Home state history me daal do
    window.history.replaceState({ viewId: 'dashboard' }, '', window.location.pathname);


    // Dashboard Cards pe click event
    toolCards.forEach(card => {
        card.addEventListener('click', function () {
            const targetViewId = this.getAttribute('data-nav');
            switchView(targetViewId);
        });
    });

    // --- BMI Calculator Logic ---
    const calcBmiBtn = document.getElementById('calc-bmi-btn');

    if (calcBmiBtn) {
        calcBmiBtn.addEventListener('click', () => {
            const weightInput = document.getElementById('bmi-weight').value;
            const heightInput = document.getElementById('bmi-height').value;

            const weight = parseFloat(weightInput);
            const heightCm = parseFloat(heightInput);

            // Basic Validation
            if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
                alert("Please enter valid positive numbers for Weight and Height.");
                return;
            }

            // Formula Calculation
            const heightM = heightCm / 100;
            const bmi = (weight / (heightM * heightM)).toFixed(1);

            // Status Logic
            let status = "";
            let statusColor = "";

            if (bmi < 18.5) {
                status = "Underweight";
                statusColor = "var(--warning)";
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                status = "Normal";
                statusColor = "var(--success)";
            } else if (bmi >= 25 && bmi <= 29.9) {
                status = "Overweight";
                statusColor = "var(--warning)";
            } else {
                status = "Obese";
                statusColor = "var(--danger)";
            }

            // DOM Update
            const resultBox = document.getElementById('bmi-result');
            document.getElementById('bmi-value').innerText = bmi;

            const statusEl = document.getElementById('bmi-status');
            statusEl.innerText = status;
            statusEl.style.color = statusColor;

            // Show Result
            resultBox.classList.remove('hidden');
        });
    }

    // --- TDEE Calculator Logic ---
    const calcTdeeBtn = document.getElementById('calc-tdee-btn');

    if (calcTdeeBtn) {
        calcTdeeBtn.addEventListener('click', () => {
            const age = parseInt(document.getElementById('tdee-age').value);
            const weight = parseFloat(document.getElementById('tdee-weight').value);
            const height = parseFloat(document.getElementById('tdee-height').value);
            const activityMultiplier = parseFloat(document.getElementById('tdee-activity').value);

            // Get selected radio button value
            const gender = document.querySelector('input[name="tdee-gender"]:checked').value;

            // Validation
            if (!age || !weight || !height || age < 15 || age > 80 || weight <= 0 || height <= 0) {
                alert("Please enter valid inputs. Age must be between 15 and 80.");
                return;
            }

            // Step 1: Calculate BMR (Mifflin-St Jeor Equation)
            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            // Step 2: Calculate TDEE
            const tdee = Math.round(bmr * activityMultiplier);

            // Update UI
            const resultBox = document.getElementById('tdee-result');
            document.getElementById('tdee-value').innerText = tdee.toLocaleString(); // Commas for readability

            // Show Result
            resultBox.classList.remove('hidden');
        });
    }

    // --- Body Fat Calculator Logic ---
    const bfGenderRadios = document.querySelectorAll('input[name="bf-gender"]');
    const hipsContainer = document.getElementById('hips-container');
    const calcBfBtn = document.getElementById('calc-bf-btn');

    // Toggle Hips field based on gender
    bfGenderRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'female') {
                hipsContainer.classList.remove('hidden');
            } else {
                hipsContainer.classList.add('hidden');
            }
        });
    });

    if (calcBfBtn) {
        calcBfBtn.addEventListener('click', () => {
            const gender = document.querySelector('input[name="bf-gender"]:checked').value;
            const height = parseFloat(document.getElementById('bf-height').value);
            const neck = parseFloat(document.getElementById('bf-neck').value);
            const waist = parseFloat(document.getElementById('bf-waist').value);
            const hips = parseFloat(document.getElementById('bf-hips').value);

            if (!height || !neck || !waist || (gender === 'female' && !hips)) {
                alert("Please fill all measurement fields correctly.");
                return;
            }

            let bodyFat = 0;

            // U.S. Navy Method Formulas
            if (gender === 'male') {
                bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
            } else {
                bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
            }

            // Display Result
            const resultBox = document.getElementById('bf-result');
            const valueEl = document.getElementById('bf-value');
            const categoryEl = document.getElementById('bf-category');

            const finalBf = bodyFat.toFixed(1);
            valueEl.innerText = finalBf + "%";

            // Simple Categorization with Colors
            let category = "";
            let statusColor = "";

            if (gender === 'male') {
                if (finalBf < 6) { category = "Essential"; statusColor = "var(--info)"; }
                else if (finalBf < 14) { category = "Athlete"; statusColor = "var(--success)"; }
                else if (finalBf < 18) { category = "Fitness"; statusColor = "var(--success)"; }
                else if (finalBf < 25) { category = "Average"; statusColor = "var(--warning)"; }
                else { category = "Obese"; statusColor = "var(--danger)"; }
            } else {
                if (finalBf < 14) { category = "Essential"; statusColor = "var(--info)"; }
                else if (finalBf < 21) { category = "Athlete"; statusColor = "var(--success)"; }
                else if (finalBf < 25) { category = "Fitness"; statusColor = "var(--success)"; }
                else if (finalBf < 32) { category = "Average"; statusColor = "var(--warning)"; }
                else { category = "Obese"; statusColor = "var(--danger)"; }
            }

            categoryEl.innerText = category;
            categoryEl.style.color = statusColor; // Ye line status ka color change karegi
            resultBox.classList.remove('hidden');

        });
    }

    // --- Mobile Burger Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {

            mobileMenuBtn.classList.add('clicked');

            // Animation khatam hone ke baad remove karo
            setTimeout(() => {
                mobileMenuBtn.classList.remove('clicked');
            }, 300);

            // Sidebar open/close toggle
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Auto-close sidebar on mobile after clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });

    // --- Close Sidebar on Outside Click ---
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');

        // Agar sidebar exist karta hai aur mobile view mein open hai
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            // Check karo ki click sidebar ke andar NAHI hua hai aur menu button par NAHI hua hai
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });



});
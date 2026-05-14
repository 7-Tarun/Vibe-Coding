document.addEventListener('DOMContentLoaded', () => {

    // --- Dark Mode Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    let themeIcon = null;
    let themeText = null;

    if (themeToggleBtn) {
        themeIcon = themeToggleBtn.querySelector('i');
        themeText = themeToggleBtn.querySelector('span');
    }

    function getRadioValue(name, defaultValue = 'male') {
        const checkedRadio = document.querySelector(`input[name="${name}"]:checked`);
        return checkedRadio ? checkedRadio.value : defaultValue;
    }

    // Function to update UI based on theme
    function applyTheme(isDark) {
        if (!themeIcon || !themeText) return;

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

    // App load hote hi initial view set karo, URL hash se
    const validViews = Array.from(navItems).map(item => item.getAttribute('data-nav'));
    const initialHash = window.location.hash.replace('#', '').trim();
    const initialView = validViews.includes(initialHash) ? initialHash : 'dashboard';
    switchView(initialView, false);
    const initialUrl = initialHash ? `#${initialView}` : window.location.pathname;
    window.history.replaceState({ viewId: initialView }, '', initialUrl);


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
            const gender = getRadioValue('tdee-gender', 'male');

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

    // --- BMR Calculator Logic ---
    const calcBmrBtn = document.getElementById('calc-bmr-btn');

    if (calcBmrBtn) {
        calcBmrBtn.addEventListener('click', () => {
            const gender = getRadioValue('bmr-gender', 'male');
            const age = parseInt(document.getElementById('bmr-age').value);
            const weight = parseFloat(document.getElementById('bmr-weight').value);
            const height = parseFloat(document.getElementById('bmr-height').value);

            if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
                alert('Please enter valid positive values for age, weight, and height.');
                return;
            }

            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            const resultBox = document.getElementById('bmr-result');
            document.getElementById('bmr-value').innerText = Math.round(bmr).toLocaleString();
            resultBox.classList.remove('hidden');
        });
    }

    // --- Calorie Calculator Logic ---
    const calcCalorieBtn = document.getElementById('calc-calorie-btn');

    if (calcCalorieBtn) {
        calcCalorieBtn.addEventListener('click', () => {
            const gender = getRadioValue('calorie-gender', 'male');
            const age = parseInt(document.getElementById('calorie-age').value);
            const weight = parseFloat(document.getElementById('calorie-weight').value);
            const height = parseFloat(document.getElementById('calorie-height').value);
            const activityMultiplier = parseFloat(document.getElementById('calorie-activity').value);
            const goal = document.getElementById('calorie-goal').value;

            if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
                alert('Please enter valid positive values for age, weight, and height.');
                return;
            }

            // Calculate BMR
            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            // Calculate TDEE
            const tdee = bmr * activityMultiplier;

            // Adjust for goal
            let calories;
            switch (goal) {
                case 'maintain':
                    calories = tdee;
                    break;
                case 'lose':
                    calories = tdee - 500; // 1 lb/week loss
                    break;
                case 'lose-fast':
                    calories = tdee - 1000; // 2 lbs/week loss
                    break;
                case 'gain':
                    calories = tdee + 500; // 1 lb/week gain
                    break;
                case 'gain-fast':
                    calories = tdee + 1000; // 2 lbs/week gain
                    break;
                default:
                    calories = tdee;
            }

            const resultBox = document.getElementById('calorie-result');
            document.getElementById('calorie-value').innerText = Math.round(calories).toLocaleString();
            resultBox.classList.remove('hidden');
        });
    }

    // --- Macro Calculator Logic ---
    const calcMacroBtn = document.getElementById('calc-macro-btn');

    if (calcMacroBtn) {
        calcMacroBtn.addEventListener('click', () => {
            const calories = parseFloat(document.getElementById('macro-calories').value);
            const goal = document.getElementById('macro-goal').value;

            if (!calories || calories <= 0) {
                alert('Please enter a valid positive number for daily calories.');
                return;
            }

            // Define macro splits based on goal
            let proteinPercent, carbPercent, fatPercent;
            switch (goal) {
                case 'balanced':
                    proteinPercent = 0.30;
                    carbPercent = 0.40;
                    fatPercent = 0.30;
                    break;
                case 'high-protein':
                    proteinPercent = 0.40;
                    carbPercent = 0.30;
                    fatPercent = 0.30;
                    break;
                case 'low-carb':
                    proteinPercent = 0.40;
                    carbPercent = 0.20;
                    fatPercent = 0.40;
                    break;
                case 'keto':
                    proteinPercent = 0.20;
                    carbPercent = 0.10;
                    fatPercent = 0.70;
                    break;
                case 'cutting':
                    proteinPercent = 0.30;
                    carbPercent = 0.50;
                    fatPercent = 0.20;
                    break;
                case 'bulking':
                    proteinPercent = 0.25;
                    carbPercent = 0.60;
                    fatPercent = 0.15;
                    break;
                default:
                    proteinPercent = 0.30;
                    carbPercent = 0.40;
                    fatPercent = 0.30;
            }

            // Calculate calories for each macro
            const proteinCalories = calories * proteinPercent;
            const carbCalories = calories * carbPercent;
            const fatCalories = calories * fatPercent;

            // Convert to grams (Protein/Carbs: 4 kcal/g, Fat: 9 kcal/g)
            const proteinGrams = Math.round(proteinCalories / 4);
            const carbGrams = Math.round(carbCalories / 4);
            const fatGrams = Math.round(fatCalories / 9);

            // Update UI
            document.getElementById('protein-grams').innerText = proteinGrams + 'g';
            document.getElementById('protein-calories').innerText = Math.round(proteinCalories) + ' kcal';

            document.getElementById('carbs-grams').innerText = carbGrams + 'g';
            document.getElementById('carbs-calories').innerText = Math.round(carbCalories) + ' kcal';

            document.getElementById('fat-grams').innerText = fatGrams + 'g';
            document.getElementById('fat-calories').innerText = Math.round(fatCalories) + ' kcal';

            const resultBox = document.getElementById('macro-result');
            resultBox.classList.remove('hidden');
        });
    }

    // --- Water Intake Calculator Logic ---
    const calcWaterBtn = document.getElementById('calc-water-btn');

    if (calcWaterBtn) {
        calcWaterBtn.addEventListener('click', () => {
            const weight = parseFloat(document.getElementById('water-weight').value);
            const activityMultiplier = parseFloat(document.getElementById('water-activity').value);
            const climateMultiplier = parseFloat(document.getElementById('water-climate').value);

            if (!weight || weight <= 0) {
                alert('Please enter a valid positive weight.');
                return;
            }

            // Base calculation: 30 ml per kg
            const baseWater = weight * 30;

            // Apply multipliers
            const totalWater = Math.round(baseWater * activityMultiplier * climateMultiplier);

            const resultBox = document.getElementById('water-result');
            document.getElementById('water-value').innerText = totalWater.toLocaleString();
            resultBox.classList.remove('hidden');
        });
    }

    // --- Protein Intake Calculator Logic ---
    const calcProteinBtn = document.getElementById('calc-protein-btn');

    if (calcProteinBtn) {
        calcProteinBtn.addEventListener('click', () => {
            const weight = parseFloat(document.getElementById('protein-weight').value);
            const activityMultiplier = parseFloat(document.getElementById('protein-activity').value);
            const goalMultiplier = parseFloat(document.getElementById('protein-goal').value);

            if (!weight || weight <= 0) {
                alert('Please enter a valid positive weight.');
                return;
            }

            // Base calculation: 0.8 g per kg (RDA)
            const baseProtein = weight * 0.8;

            // Apply multipliers
            const totalProtein = Math.round(baseProtein * activityMultiplier * goalMultiplier);

            const resultBox = document.getElementById('protein-result');
            document.getElementById('protein-value').innerText = totalProtein.toLocaleString();
            resultBox.classList.remove('hidden');
        });
    }

    // --- Ideal Weight Calculator Logic ---
    const calcIdealWeightBtn = document.getElementById('calc-ideal-weight-btn');

    if (calcIdealWeightBtn) {
        calcIdealWeightBtn.addEventListener('click', () => {
            const height = parseFloat(document.getElementById('ideal-height').value);
            const gender = getRadioValue('ideal-gender', 'male');

            if (!height || height <= 0) {
                alert('Please enter a valid positive height.');
                return;
            }

            const heightMeters = height / 100;
            const lowIdeal = 18.5 * heightMeters * heightMeters;
            const highIdeal = 24.9 * heightMeters * heightMeters;

            let devineWeight;
            if (height > 152.4) {
                const extraInches = (height - 152.4) / 2.54;
                devineWeight = gender === 'male'
                    ? 50 + (2.3 * extraInches)
                    : 45.5 + (2.3 * extraInches);
            } else {
                devineWeight = gender === 'male' ? 50 : 45.5;
            }

            const resultRange = `${Math.round(lowIdeal * 10) / 10} - ${Math.round(highIdeal * 10) / 10}`;
            const targetWeight = `${Math.round(devineWeight * 10) / 10} kg`;

            const resultBox = document.getElementById('ideal-weight-result');
            document.getElementById('ideal-weight-range').innerText = resultRange;
            document.getElementById('ideal-weight-note').innerText = `Estimated target weight using the Devine formula: ${targetWeight}. Adjust as needed for body composition.`;
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
            const gender = getRadioValue('bf-gender', 'male');
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

    // PWA Custom Install Button Logic
    let deferredPrompt;
    const installBtn = document.getElementById('installAppBtn');

    // Ye event tab fire hota hai jab browser PWA install karne ke liye ready hota hai
    window.addEventListener('beforeinstallprompt', (e) => {
        // Browser ka default mini-infobar rokna
        e.preventDefault();
        // Event ko save kar lo taaki button click hone par use kar sakein
        deferredPrompt = e;

        // Only show install button on mobile view
        if (installBtn) {
            if (window.innerWidth <= 768) {
                installBtn.style.display = 'block';
            } else {
                installBtn.style.display = 'none';
            }
        }
    });

    // Jab user tere Download button par click kare
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt !== null) {
                // Browser ka asli installation prompt show karo
                deferredPrompt.prompt();

                // Wait karo ki user ne Install dabaya ya Cancel
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User ne App install kar liya');
                } else {
                    console.log('User ne installation cancel kar di');
                }

                // Ek baar prompt use hone ke baad usse clear kar do
                deferredPrompt = null;
                // Button ko wapas hide kar do (kyunki app install ho chuka hai)
                installBtn.style.display = 'none';
            }
        });
    }

    // Check if already installed
    window.addEventListener('appinstalled', () => {
        // Agar kisi aur tarike se install ho gaya, toh button hide kar do
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        console.log('PWA was installed');
    });


});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully.');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
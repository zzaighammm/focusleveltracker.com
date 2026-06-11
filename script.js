/* ============================================
   FOCUS TRACKER - JAVASCRIPT LOGIC
   ============================================ */

// Data structure to store current analysis
let currentAnalysis = {
    name: '',
    sleep: 7,
    screenTime: 3,
    caffeine: 1,
    breaks: 1,
    environment: 'quiet',
    exercise: false,
    focusDuration: 90,
    focusScore: 100,
    scoreLevel: 'Excellent',
    recommendations: [],
    timestamp: new Date()
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    applyThemePreference();
});

function initializeEventListeners() {
    // Slider listeners
    document.getElementById('sleepSlider').addEventListener('input', updateSleepDisplay);
    document.getElementById('screenSlider').addEventListener('input', updateScreenDisplay);
    document.getElementById('caffeineSlider').addEventListener('input', updateCaffeineDisplay);
    document.getElementById('breaksSlider').addEventListener('input', updateBreaksDisplay);

    // Environment buttons
    document.querySelectorAll('.env-btn').forEach(btn => {
        btn.addEventListener('click', handleEnvironmentSelect);
    });

    // Form submission
    document.getElementById('focusForm').addEventListener('submit', handleFormSubmit);

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadReport);

    // Edit button
    document.getElementById('editBtn').addEventListener('click', editAnswers);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Real-time slider value updates
    updateSleepDisplay();
    updateScreenDisplay();
    updateCaffeineDisplay();
    updateBreaksDisplay();
}

// ============================================
// SLIDER UPDATE FUNCTIONS
// ============================================

function updateSleepDisplay() {
    const value = parseFloat(document.getElementById('sleepSlider').value);
    currentAnalysis.sleep = value;
    document.getElementById('sleepValue').textContent = value + 'h';
}

function updateScreenDisplay() {
    const value = parseFloat(document.getElementById('screenSlider').value);
    currentAnalysis.screenTime = value;
    document.getElementById('screenValue').textContent = value + 'h';
}

function updateCaffeineDisplay() {
    const value = parseFloat(document.getElementById('caffeineSlider').value);
    currentAnalysis.caffeine = value;
    document.getElementById('caffeineValue').textContent = value + ' cups';
}

function updateBreaksDisplay() {
    const value = parseFloat(document.getElementById('breaksSlider').value);
    currentAnalysis.breaks = value;
    document.getElementById('breaksValue').textContent = value;
}

// ============================================
// ENVIRONMENT SELECTION
// ============================================

function handleEnvironmentSelect(event) {
    event.preventDefault();

    // Remove active class from all buttons
    document.querySelectorAll('.env-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button
    event.target.classList.add('active');

    // Update current analysis
    currentAnalysis.environment = event.target.dataset.env;
    document.getElementById('environmentInput').value = event.target.dataset.env;
}

// ============================================
// FORM SUBMISSION & CALCULATION
// ============================================

function handleFormSubmit(event) {
    event.preventDefault();

    // Get form data
    currentAnalysis.name = document.getElementById('nameInput').value;
    currentAnalysis.exercise = document.getElementById('exerciseCheckbox').checked;

    // Calculate focus metrics
    calculateFocusDuration();
    generateRecommendations();

    // Update timestamp
    currentAnalysis.timestamp = new Date();

    // Display results
    displayResults();

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// FOCUS DURATION CALCULATION ALGORITHM
// ============================================

function calculateFocusDuration() {
    // Sleep impact (0-20 points)
    let sleepScore = 0;
    if (currentAnalysis.sleep >= 7 && currentAnalysis.sleep <= 9) {
        sleepScore = 20; // Optimal sleep
    } else if (currentAnalysis.sleep >= 6 && currentAnalysis.sleep < 7) {
        sleepScore = 15;
    } else if (currentAnalysis.sleep >= 9 && currentAnalysis.sleep <= 10) {
        sleepScore = 15;
    } else if (currentAnalysis.sleep >= 5 && currentAnalysis.sleep < 6) {
        sleepScore = 5;
    } else if (currentAnalysis.sleep < 5) {
        sleepScore = 0;
    } else if (currentAnalysis.sleep > 10) {
        sleepScore = 10; // Too much sleep might indicate lethargy
    }

    // Screen time impact (0-15 points) - lower is better
    let screenScore = 0;
    if (currentAnalysis.screenTime <= 1) {
        screenScore = 15;
    } else if (currentAnalysis.screenTime <= 2) {
        screenScore = 12;
    } else if (currentAnalysis.screenTime <= 3) {
        screenScore = 8;
    } else if (currentAnalysis.screenTime <= 4) {
        screenScore = 4;
    } else {
        screenScore = 0;
    }

    // Caffeine impact (0-15 points) - moderation is key
    let caffeineScore = 0;
    if (currentAnalysis.caffeine >= 0.5 && currentAnalysis.caffeine <= 2) {
        caffeineScore = 15; // Optimal
    } else if (currentAnalysis.caffeine >= 2 && currentAnalysis.caffeine <= 3) {
        caffeineScore = 12;
    } else if (currentAnalysis.caffeine >= 3 && currentAnalysis.caffeine <= 4) {
        caffeineScore = 8;
    } else if (currentAnalysis.caffeine >= 4) {
        caffeineScore = 2; // Too much caffeine can cause jitteriness
    } else if (currentAnalysis.caffeine < 0.5) {
        caffeineScore = 10; // Some caffeine is better than none
    }

    // Breaks impact (0-15 points)
    let breaksScore = 0;
    if (currentAnalysis.breaks >= 1 && currentAnalysis.breaks <= 2) {
        breaksScore = 15; // Optimal breaks
    } else if (currentAnalysis.breaks >= 0.5 && currentAnalysis.breaks < 1) {
        breaksScore = 12;
    } else if (currentAnalysis.breaks >= 2 && currentAnalysis.breaks <= 3) {
        breaksScore = 12;
    } else if (currentAnalysis.breaks > 3) {
        breaksScore = 8;
    } else if (currentAnalysis.breaks < 0.5) {
        breaksScore = 0;
    }

    // Environment impact (0-15 points)
    let environmentScore = 0;
    switch (currentAnalysis.environment) {
        case 'quiet':
            environmentScore = 15;
            break;
        case 'moderate':
            environmentScore = 10;
            break;
        case 'noisy':
            environmentScore = 3;
            break;
    }

    // Exercise impact (0-10 points bonus)
    let exerciseBonus = currentAnalysis.exercise ? 10 : 0;

    // Calculate total score
    currentAnalysis.focusScore = Math.min(100, sleepScore + screenScore + caffeineScore + breaksScore + environmentScore + exerciseBonus);

    // Calculate focus duration based on score (10-90 minute range)
    // Formula: Minimum(10) + (Score/100 * Range(80))
    currentAnalysis.focusDuration = Math.round(10 + (currentAnalysis.focusScore / 100) * 80);

    // Determine score level
    if (currentAnalysis.focusScore >= 90) {
        currentAnalysis.scoreLevel = 'Excellent';
    } else if (currentAnalysis.focusScore >= 75) {
        currentAnalysis.scoreLevel = 'Good';
    } else if (currentAnalysis.focusScore >= 60) {
        currentAnalysis.scoreLevel = 'Fair';
    } else if (currentAnalysis.focusScore >= 45) {
        currentAnalysis.scoreLevel = 'Needs Improvement';
    } else {
        currentAnalysis.scoreLevel = 'Poor';
    }
}

// ============================================
// RECOMMENDATIONS ENGINE
// ============================================

function generateRecommendations() {
    currentAnalysis.recommendations = [];

    // Sleep recommendations
    if (currentAnalysis.sleep < 6) {
        currentAnalysis.recommendations.push(
            'Try to get at least 6-8 hours of sleep — improved sleep directly enhances concentration and cognitive performance.'
        );
    } else if (currentAnalysis.sleep > 10) {
        currentAnalysis.recommendations.push(
            'While rest is important, excessive sleep might indicate fatigue or lethargy — aim for 7-9 hours.'
        );
    }

    // Screen time recommendations
    if (currentAnalysis.screenTime > 4) {
        currentAnalysis.recommendations.push(
            'Reduce recreational screen time before studying — excessive screen exposure causes eye strain and mental fatigue.'
        );
    }

    // Exercise recommendations
    if (!currentAnalysis.exercise) {
        currentAnalysis.recommendations.push(
            'Add 20-30 minutes of light exercise — it boosts cognitive endurance and improves blood flow to the brain.'
        );
    }

    // Caffeine recommendations
    if (currentAnalysis.caffeine === 0) {
        currentAnalysis.recommendations.push(
            'Consider a moderate amount of caffeine (1-2 cups) — it can enhance focus when consumed wisely.'
        );
    } else if (currentAnalysis.caffeine > 4) {
        currentAnalysis.recommendations.push(
            'Reduce caffeine intake — excessive caffeine causes jitteriness and can decrease focus quality.'
        );
    }

    // Breaks recommendations
    if (currentAnalysis.breaks < 1) {
        currentAnalysis.recommendations.push(
            'Include more short breaks during study sessions — taking 5-minute breaks every hour maintains focus.'
        );
    }

    // Environment recommendations
    if (currentAnalysis.environment === 'noisy') {
        currentAnalysis.recommendations.push(
            'Try studying in a quieter environment — noise significantly impacts concentration ability.'
        );
    }

    // General encouragement for excellent score
    if (currentAnalysis.focusScore >= 90) {
        currentAnalysis.recommendations.push(
            'Great job maintaining healthy habits! Keep this routine and consider documenting your study patterns.'
        );
    }

    // Limit to 5 recommendations
    currentAnalysis.recommendations = currentAnalysis.recommendations.slice(0, 5);
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults() {
    // Hide tips section
    document.getElementById('tipsSection').style.display = 'none';

    // Add has-results class to main-content to trigger layout change
    document.querySelector('.main-content').classList.add('has-results');

    // Update focus duration
    document.getElementById('focusDuration').textContent = currentAnalysis.focusDuration;

    // Update focus score
    document.getElementById('focusScore').textContent = currentAnalysis.focusScore;
    document.getElementById('scoreLevel').textContent = currentAnalysis.scoreLevel;

    // Update score bar
    const scorePercentage = (currentAnalysis.focusScore / 100) * 100;
    document.getElementById('scoreBarFill').style.width = scorePercentage + '%';

    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';

    currentAnalysis.recommendations.forEach((rec, index) => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.innerHTML = `
            <span class="recommendation-number">${index + 1}</span>
            <span class="recommendation-text">${rec}</span>
        `;
        recommendationsList.appendChild(recElement);
    });

    // Show results section
    document.getElementById('resultsSection').style.display = 'flex';

    // Add fade-in animation
    document.getElementById('resultsSection').classList.add('fade-in');
}

// ============================================
// DOWNLOAD REPORT FUNCTIONALITY
// ============================================

function downloadReport() {
    const reportContent = generateReportContent();

    // Create blob
    const blob = new Blob([reportContent], { type: 'text/plain' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focus-tracker-report-${new Date().getTime()}.txt`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(url);

    // Show success feedback
    showDownloadFeedback();
}

function generateReportContent() {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    let report = '';
    report += '═══════════════════════════════════════════════════════════════\n';
    report += '                 FOCUS TRACKER ANALYSIS REPORT\n';
    report += '═══════════════════════════════════════════════════════════════\n\n';

    report += `Generated: ${formattedDate} at ${time}\n`;
    if (currentAnalysis.name) {
        report += `User: ${currentAnalysis.name}\n`;
    }
    report += '\n───────────────────────────────────────────────────────────────\n';
    report += '                        YOUR RESULTS\n';
    report += '───────────────────────────────────────────────────────────────\n\n';

    report += `Estimated Focus Duration:   ${currentAnalysis.focusDuration} minutes per session\n`;
    report += `Focus Score:                ${currentAnalysis.focusScore}/100 - ${currentAnalysis.scoreLevel}\n\n`;

    report += '───────────────────────────────────────────────────────────────\n';
    report += '                      YOUR INPUT DATA\n';
    report += '───────────────────────────────────────────────────────────────\n\n';

    report += `Sleep Last Night:           ${currentAnalysis.sleep} hours\n`;
    report += `Daily Screen Time:          ${currentAnalysis.screenTime} hours\n`;
    report += `Caffeinated Drinks:         ${currentAnalysis.caffeine} cups\n`;
    report += `Study Breaks per Hour:      ${currentAnalysis.breaks}\n`;
    report += `Study Environment:          ${capitalizeFirst(currentAnalysis.environment)}\n`;
    report += `Exercise Today (20+ min):   ${currentAnalysis.exercise ? 'Yes ✓' : 'No'}\n\n`;

    report += '───────────────────────────────────────────────────────────────\n';
    report += '                    RECOMMENDATIONS\n';
    report += '───────────────────────────────────────────────────────────────\n\n';

    if (currentAnalysis.recommendations.length > 0) {
        currentAnalysis.recommendations.forEach((rec, index) => {
            report += `${index + 1}. ${rec}\n\n`;
        });
    } else {
        report += 'You are maintaining excellent habits! Keep up the great work.\n\n';
    }

    report += '───────────────────────────────────────────────────────────────\n';
    report += '                    FOCUS TIPS & STRATEGIES\n';
    report += '───────────────────────────────────────────────────────────────\n\n';

    report += `• Sleep: Aim for 7-9 hours of quality sleep each night\n`;
    report += `• Screen Time: Limit recreational screen time to 2-3 hours daily\n`;
    report += `• Exercise: Include at least 20-30 minutes of physical activity\n`;
    report += `• Caffeine: Moderate intake (1-2 cups) can enhance focus\n`;
    report += `• Breaks: Take 5-minute breaks every hour of study\n`;
    report += `• Environment: Study in a quiet, organized space\n`;
    report += `• Hydration: Drink water regularly to maintain mental clarity\n`;
    report += `• Nutrition: Eat balanced meals for sustained energy\n\n`;

    report += '───────────────────────────────────────────────────────────────\n';
    report += 'Student Concentration & Focus Tracker\n';
    report += 'Building Productive Study Habits\n';
    report += '═══════════════════════════════════════════════════════════════\n';

    return report;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showDownloadFeedback() {
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span class="download-icon">✓</span> Report Downloaded!';
    btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}

// ============================================
// EDIT FUNCTIONALITY
// ============================================

function editAnswers() {
    // Remove has-results class to restore centered layout
    document.querySelector('.main-content').classList.remove('has-results');

    // Hide results
    document.getElementById('resultsSection').style.display = 'none';

    // Show tips
    document.getElementById('tipsSection').style.display = 'block';

    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

    // Clear name input for fresh start (optional)
    // document.getElementById('nameInput').focus();
}

// ============================================
// THEME TOGGLE (DARK MODE)
// ============================================

function toggleTheme() {
    document.body.classList.toggle('dark-mode');

    // Save theme preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    // Update icon
    const icon = document.querySelector('.theme-icon');
    icon.textContent = isDarkMode ? '☀️' : '🌙';
}

function applyThemePreference() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Prevent form submission on Enter for sliders
document.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && event.target.classList.contains('slider')) {
        event.preventDefault();
    }
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

console.log('Focus Tracker initialized successfully! 🎯');

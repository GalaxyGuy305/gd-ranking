document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('level-container');
    const btnClassic = document.getElementById('btn-classic');
    const btnPlatformer = document.getElementById('btn-platformer');
    
    let allData = {}; // Store fetched data here
    let currentMode = 'classic'; // Default mode

    // Helper: Turn "Extreme Demon" into "diff-extreme-demon"
    function getDifficultyClass(difficultyText) {
        if (!difficultyText) return 'diff-unknown';
        // Lowercase and replace spaces with hyphens
        return 'diff-' + difficultyText.toLowerCase().replace(/\s+/g, '-');
    }

    function createLevelCard(level, index) {
        const rank = index + 1;
        
        let rankClass = '';
        if (rank === 1) rankClass = 'top-1';
        else if (rank === 2) rankClass = 'top-2';
        else if (rank === 3) rankClass = 'top-3';

        const diffClass = getDifficultyClass(level.difficulty);

        const article = document.createElement('article');
        article.className = 'level-card';
        
        article.innerHTML = `
            <div class="rank-badge ${rankClass}">#${rank}</div>
            <div class="card-content-wrapper">
                <img src="${level.thumbnail}" alt="${level.name}" class="card-thumbnail" loading="lazy">
                <div class="card-details">
                    <div class="level-header">
                        <div>
                            <h2 class="level-title">${level.name}</h2>
                            <span class="level-creator">by ${level.creator}</span>
                        </div>
                        <span class="difficulty-tag ${diffClass}">${level.difficulty}</span>
                    </div>
                    <p class="level-description">${level.description}</p>
                    <a href="${level.video}" target="_blank" rel="noopener noreferrer" class="video-btn">
                        ▶ Watch Gameplay
                    </a>
                </div>
            </div>
        `;
        return article;
    }

    function renderLevels(mode) {
        container.innerHTML = ''; // Clear current list
        
        // Get correct array based on mode
        const levels = allData[mode];

        if (!levels || levels.length === 0) {
            container.innerHTML = '<div class="loading">No levels found for this category.</div>';
            return;
        }

        levels.forEach((level, index) => {
            const card = createLevelCard(level, index);
            container.appendChild(card);
        });
    }

    function switchTab(mode) {
        currentMode = mode;
        
        // Update Button Styles
        if (mode === 'classic') {
            btnClassic.classList.add('active');
            btnPlatformer.classList.remove('active');
        } else {
            btnPlatformer.classList.add('active');
            btnClassic.classList.remove('active');
        }

        // Re-render list
        renderLevels(mode);
    }

    // Initialize
    fetch('levels.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allData = data; // Save data globally
            switchTab('classic'); // Load classic by default
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = `
                <div class="error">
                    <p>Failed to load levels.</p>
                    <small>${error.message}</small>
                </div>
            `;
        });

    // Event Listeners for Tabs
    btnClassic.addEventListener('click', () => switchTab('classic'));
    btnPlatformer.addEventListener('click', () => switchTab('platformer'));
});
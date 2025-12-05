document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('level-container');
    const btnClassic = document.getElementById('btn-classic');
    const btnPlatformer = document.getElementById('btn-platformer');

    // --- NEW: Modal Elements ---
    const modal = document.getElementById('completions-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-level-name');
    const modalList = document.getElementById('modal-completions-list');
    
    let allData = {}; // Store fetched data here
    let currentMode = 'classic'; // Default mode

    // Helper: Turn "Extreme Demon" into "diff-extreme-demon"
    function getDifficultyClass(difficultyText) {
        if (!difficultyText) return 'diff-unknown';
        // Lowercase and replace spaces with hyphens
        return 'diff-' + difficultyText.toLowerCase().replace(/\s+/g, '-');
    }

    // --- NEW: Helper to format score (time or percent) ---
    function formatScore(score, mode) {
        if (mode === 'classic') {
            return `${score}%`;
        } 
        
        // Platformer mode: score is in seconds
        try {
            const totalS = parseFloat(score);
            const hours = Math.floor(totalS / 3600);
            const minutes = Math.floor((totalS % 3600) / 60);
            const seconds = totalS % 60;

            const pad = (num) => String(num).padStart(2, '0');
            
            // Format seconds to 3 decimal places (milliseconds)
            const [secInt, secMs] = String(seconds.toFixed(3)).split('.');
            
            let timeStr = `${pad(minutes)}:${pad(secInt)}.${secMs}`;
            
            if (hours > 0) {
                timeStr = `${pad(hours)}:${timeStr}`;
            }
            return timeStr;

        } catch (e) {
            console.error("Error formatting time:", e);
            return "Invalid Time";
        }
    }

    // --- NEW: Function to show the modal with completions ---
    function showCompletions(level, mode) {
        // Set level name
        modalTitle.textContent = level.name;

        // Get completions, default to empty array
        const completions = level.completions || [];

        if (completions.length === 0) {
            modalList.innerHTML = '<p class="no-completions">No one has completed this level yet.</p>';
        } else {
            // Sort the completions
            if (mode === 'classic') {
                // Highest % first
                completions.sort((a, b) => b.score - a.score);
            } else {
                // Lowest time (seconds) first
                completions.sort((a, b) => a.score - b.score);
            }

            // Build the HTML table
            let tableHTML = `
                <table class="completions-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>${mode === 'classic' ? 'Progress' : 'Time'}</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            completions.forEach((comp, index) => {
                tableHTML += `
                    <tr>
                        <td>#${index + 1}</td>
                        <td>${comp.player}</td>
                        <td>${formatScore(comp.score, mode)}</td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';
            modalList.innerHTML = tableHTML;
        }

        // Show the modal
        modal.style.display = 'flex';
    }

    // --- NEW: Function to hide the modal ---
    function hideModal() {
        modal.style.display = 'none';
    }

    // --- UPDATED: createLevelCard now takes 'mode' as an argument ---
    function createLevelCard(level, index, mode) {
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

        // --- NEW: Add click listener to the card ---
        article.addEventListener('click', (e) => {
            // Prevent modal from opening if the user clicks the video button
            if (e.target.closest('.video-btn')) {
                return;
            }
            showCompletions(level, mode);
        });

        return article;
    }

    // --- UPDATED: renderLevels now passes 'mode' to createLevelCard ---
    function renderLevels(mode) {
        container.innerHTML = ''; // Clear current list
        
        // Get correct array based on mode
        const levels = allData[mode];

        if (!levels || levels.length === 0) {
            container.innerHTML = '<div class="loading">No levels found for this category.</div>';
            return;
        }

        levels.forEach((level, index) => {
            // Pass the 'mode' to the card creator
            const card = createLevelCard(level, index, mode); 
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

    // --- NEW: Event Listeners for Modal ---
    modalCloseBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        // Close modal if user clicks on the dark overlay, but not the content
        if (e.target === modal) {
            hideModal();
        }
    });

    // Event Listeners for Tabs
    btnClassic.addEventListener('click', () => switchTab('classic'));
    btnPlatformer.addEventListener('click', () => switchTab('platformer'));
});
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('level-container');

    // Function to render the level card HTML
    function createLevelCard(level, index) {
        const rank = index + 1;
        
        // Determine rank class for specific styling (Gold/Silver/Bronze)
        let rankClass = '';
        if (rank === 1) rankClass = 'top-1';
        else if (rank === 2) rankClass = 'top-2';
        else if (rank === 3) rankClass = 'top-3';

        const article = document.createElement('article');
        article.className = 'level-card';
        
        article.innerHTML = `
            <div class="rank-badge ${rankClass}">#${rank}</div>
            <div class="card-content-wrapper">
                <img src="${level.thumbnail}" alt="${level.name} Thumbnail" class="card-thumbnail" loading="lazy">
                <div class="card-details">
                    <div class="level-header">
                        <div>
                            <h2 class="level-title">${level.name}</h2>
                            <span class="level-creator">by ${level.creator}</span>
                        </div>
                        <span class="difficulty-tag">${level.difficulty}</span>
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

    // Fetch and process data
    fetch('levels.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Clear loading message
            container.innerHTML = '';

            // Render each level
            // Note: The data is assumed to be ordered in the JSON (Rank #1 is first)
            // If you need explicit sorting, you can add .sort() here before map
            data.forEach((level, index) => {
                const card = createLevelCard(level, index);
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching levels:', error);
            container.innerHTML = `
                <div class="error">
                    <p>Failed to load level data.</p>
                    <small>${error.message}</small>
                </div>
            `;
        });
});
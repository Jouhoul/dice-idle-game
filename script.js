// Game State
let gameState = {
    coins: 0,
    level: 1,
    xp: 0,
    xpToNext: 100,
    combatUnlocked: false,
    diceMax: 6,
    autoRoller: false
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    drawDice();
});

function initializeGame() {
    updateUI();
    
    // Check if combat should be unlocked
    if (gameState.level >= 3) {
        unlockCombat();
    }
}

function setupEventListeners() {
    // Main UI buttons
    document.getElementById('rollDiceBtn').addEventListener('click', rollDice);
    document.getElementById('shopBtn').addEventListener('click', () => togglePanel('shopPanel'));
    document.getElementById('skillsBtn').addEventListener('click', () => togglePanel('skillsPanel'));
    document.getElementById('combatBtn').addEventListener('click', () => togglePanel('combatPanel'));
    document.getElementById('settingsBtn').addEventListener('click', () => togglePanel('settingsPanel'));
    
    // Settings panel
    document.getElementById('volumeSlider').addEventListener('input', function() {
        document.getElementById('volumeValue').textContent = this.value + '%';
    });
    
    document.getElementById('resetGameBtn').addEventListener('click', resetGame);
    
    // Shop buttons
    document.querySelectorAll('.buy-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => buyShopItem(index));
    });
    
    // Skill buttons
    document.querySelectorAll('.upgrade-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => upgradeSkill(index));
    });
    
    // Combat button
    const attackBtn = document.getElementById('attackBtn');
    if (attackBtn) {
        attackBtn.addEventListener('click', attack);
    }
    
    // Close panels when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.panel') && !e.target.closest('.ui-button')) {
            closeAllPanels();
        }
    });
}

// Dice rolling logic
function rollDice() {
    const roll = Math.floor(Math.random() * gameState.diceMax) + 1;
    const coinsEarned = roll * gameState.level;
    
    gameState.coins += coinsEarned;
    gameState.xp += roll;
    
    // Level up check
    if (gameState.xp >= gameState.xpToNext) {
        levelUp();
    }
    
    updateUI();
    animateDiceRoll(roll);
    
    // Show floating text for coins earned
    showFloatingText(`+${coinsEarned} coins`, '#00b894');
}

function levelUp() {
    gameState.level++;
    gameState.xp -= gameState.xpToNext;
    gameState.xpToNext = Math.floor(gameState.xpToNext * 1.5);
    
    // Unlock combat at level 3
    if (gameState.level === 3) {
        unlockCombat();
    }
    
    showFloatingText(`Level Up! Level ${gameState.level}`, '#6c5ce7');
}

function unlockCombat() {
    gameState.combatUnlocked = true;
    document.getElementById('combatBtn').style.display = 'inline-block';
}

// Panel management
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const isVisible = panel.style.display === 'block';
    
    // Toggle the specific panel
    if (isVisible) {
        closePanel(panelId);
    } else {
        panel.style.display = 'block';
        panel.style.animation = 'slideIn 0.3s ease';
    }
}

function closePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
        panel.style.display = 'none';
    }, 300);
}

function closeAllPanels() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        if (panel.style.display === 'block') {
            panel.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                panel.style.display = 'none';
            }, 300);
        }
    });
}

// Shop functions
function buyShopItem(index) {
    const items = [
        { name: 'Better Dice', cost: 100, effect: () => gameState.diceMax += 2 },
        { name: 'Lucky Charm', cost: 250, effect: () => gameState.level += 1 },
        { name: 'Auto Roller', cost: 500, effect: () => enableAutoRoller() }
    ];
    
    const item = items[index];
    if (gameState.coins >= item.cost) {
        gameState.coins -= item.cost;
        item.effect();
        updateUI();
        showFloatingText(`Bought ${item.name}!`, '#00b894');
    } else {
        showFloatingText('Not enough coins!', '#e74c3c');
    }
}

function enableAutoRoller() {
    if (!gameState.autoRoller) {
        gameState.autoRoller = true;
        setInterval(() => {
            if (gameState.autoRoller) {
                rollDice();
            }
        }, 2000);
    }
}

// Skill functions
function upgradeSkill(index) {
    const cost = (index + 1) * 50;
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        // Add skill upgrade logic here
        updateUI();
        showFloatingText('Skill upgraded!', '#ee5a24');
    } else {
        showFloatingText('Not enough coins!', '#e74c3c');
    }
}

// Combat functions
function attack() {
    // Simple combat logic
    const damage = Math.floor(Math.random() * 20) + 10;
    showFloatingText(`Dealt ${damage} damage!`, '#e74c3c');
}

// UI Updates
function updateUI() {
    document.getElementById('coinCount').textContent = gameState.coins;
    document.getElementById('playerLevel').textContent = gameState.level;
    document.getElementById('playerXP').textContent = `${gameState.xp}/${gameState.xpToNext}`;
}

// Canvas drawing
function drawDice() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let x = 0; x < canvas.width; x += 50) {
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Draw dice in center
    const diceSize = 100;
    const x = (canvas.width - diceSize) / 2;
    const y = (canvas.height - diceSize) / 2;
    
    // Dice background
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, diceSize, diceSize);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, diceSize, diceSize);
    
    // Draw dice dots (default showing 1)
    drawDiceDots(ctx, x, y, diceSize, 1);
}

function drawDiceDots(ctx, x, y, size, number) {
    const dotSize = 8;
    const offset = size / 4;
    
    ctx.fillStyle = '#333';
    
    switch(number) {
        case 1:
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            break;
        case 2:
            ctx.beginPath();
            ctx.arc(x + offset, y + offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + size - offset, y + size - offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            break;
        case 3:
            ctx.beginPath();
            ctx.arc(x + offset, y + offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + size - offset, y + size - offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            break;
        case 4:
            ctx.beginPath();
            ctx.arc(x + offset, y + offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + size - offset, y + offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + offset, y + size - offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + size - offset, y + size - offset, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            break;
        case 5:
            drawDiceDots(ctx, x, y, size, 4);
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            break;
        case 6:
            drawDiceDots(ctx, x, y, size, 4);
            ctx.beginPath();
            ctx.arc(x + offset, y + size/2, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + size - offset, y + size/2, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            break;
    }
}

function animateDiceRoll(result) {
    let frame = 0;
    const maxFrames = 20;
    
    const animate = () => {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear and redraw background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x < canvas.width; x += 50) {
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        const diceSize = 100;
        const x = (canvas.width - diceSize) / 2;
        const y = (canvas.height - diceSize) / 2;
        
        // Dice background with animation
        const rotation = (frame / maxFrames) * Math.PI * 2;
        ctx.save();
        ctx.translate(x + diceSize/2, y + diceSize/2);
        ctx.rotate(rotation);
        ctx.translate(-diceSize/2, -diceSize/2);
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, diceSize, diceSize);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, diceSize, diceSize);
        
        if (frame < maxFrames) {
            const randomDots = Math.floor(Math.random() * 6) + 1;
            drawDiceDots(ctx, 0, 0, diceSize, randomDots);
            frame++;
            ctx.restore();
            requestAnimationFrame(animate);
        } else {
            drawDiceDots(ctx, 0, 0, diceSize, result);
            ctx.restore();
        }
    };
    
    animate();
}

// Utility functions
function showFloatingText(text, color) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.cssText = `
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translateX(-50%);
        color: ${color};
        font-size: 24px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        z-index: 2000;
        animation: floatUp 2s ease-out forwards;
    `;
    
    document.body.appendChild(floatingText);
    
    setTimeout(() => {
        document.body.removeChild(floatingText);
    }, 2000);
}

function resetGame() {
    if (confirm('Are you sure you want to reset your game? This cannot be undone.')) {
        gameState = {
            coins: 0,
            level: 1,
            xp: 0,
            xpToNext: 100,
            combatUnlocked: false,
            diceMax: 6,
            autoRoller: false
        };
        
        document.getElementById('combatBtn').style.display = 'none';
        updateUI();
        drawDice();
        closeAllPanels();
        showFloatingText('Game Reset!', '#e74c3c');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100px);
        }
    }
`;
document.head.appendChild(style);
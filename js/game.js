// Capys Game - Main Game Loop

const Game = {
    // Game state
    isRunning: false,
    tickRate: 100, // ms per tick (10 ticks per second)
    tickCount: 0,
    
    // Performance tracking
    lastTickTime: 0,
    
    // Message log
    maxMessages: 50,

    // Initialize game
    init() {
        console.log('Initializing Capys Game...');
        
        // Initialize all systems
        Resources.init();
        Buildings.init();
        Population.init();
        HotSprings.init();
        Seasons.init();
        Research.init();
        Visitors.init();
        Prestige.init();
        SaveSystem.init();
        
        // Try to load save
        if (SaveSystem.hasSave()) {
            SaveSystem.load();
            this.log('Welcome back! Your capybaras missed you.', 'welcome');
        } else {
            this.log('Welcome to Capys Game! Your capybara adventure begins...', 'welcome');
        }
        
        // Apply prestige bonuses
        Prestige.recalculateBonuses();
        
        // Recalculate rates
        Resources.recalculateRates();
        
        // Initialize UI
        UI.init();
        
        // Start game loop
        this.start();
    },

    // Start game loop
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTickTime = Date.now();
        this.gameLoop();
        
        console.log('Game started!');
    },

    // Stop game loop
    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    },

    // Main game loop
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const delta = now - this.lastTickTime;
        
        // Process ticks based on elapsed time
        if (delta >= this.tickRate) {
            const ticksToProcess = Math.floor(delta / this.tickRate);
            
            for (let i = 0; i < ticksToProcess; i++) {
                this.tick();
            }
            
            this.lastTickTime = now - (delta % this.tickRate);
            
            // Update UI (not every tick for performance)
            if (this.tickCount % 5 === 0) {
                UI.updateAll();
            }
        }
        
        requestAnimationFrame(() => this.gameLoop());
    },

    // Process one game tick
    tick() {
        this.tickCount++;
        
        // Update seasons and time
        Seasons.tick();
        
        // Update hot springs (warmth, soaking)
        HotSprings.tick();
        
        // Recalculate production rates periodically
        if (this.tickCount % 10 === 0) {
            Resources.recalculateRates();
        }
        
        // Update resources (production/consumption)
        Resources.tick();
        
        // Update population (growth)
        Population.tick();
        
        // Update visitors
        Visitors.tick();
        
        // Auto-save check
        SaveSystem.tick();
    },

    // Calculate overall productivity multiplier
    getProductivity() {
        let productivity = 1;
        
        // Warmth bonus/penalty
        productivity *= HotSprings.getWarmthProductivity();
        
        // Relaxation bonus
        productivity *= HotSprings.getRelaxationBonus();
        
        // Outdoor work multiplier (weather/season)
        productivity *= Seasons.getOutdoorWorkMultiplier();
        
        // Visitor bonuses
        productivity *= Visitors.getNightBonus();
        
        // Legacy bonus
        productivity *= Prestige.getGatheringBonus();
        
        return productivity;
    },

    // Log a message
    log(message, type = '') {
        const logEl = document.getElementById('message-log');
        if (!logEl) return;
        
        // Create message element
        const msgEl = document.createElement('div');
        msgEl.className = `message ${type}`;
        msgEl.textContent = message;
        
        // Add to top
        logEl.insertBefore(msgEl, logEl.firstChild);
        
        // Limit messages
        while (logEl.children.length > this.maxMessages) {
            logEl.removeChild(logEl.lastChild);
        }
        
        // Update status bar
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }
};

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen briefly
    setTimeout(() => {
        Game.init();
        
        // Hide loading screen after init
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);
});

// Save before leaving
window.addEventListener('beforeunload', () => {
    SaveSystem.save();
});


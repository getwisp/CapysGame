// Capys Game - Save/Load System

const SaveSystem = {
    // Save key for localStorage
    saveKey: 'capysGame_save',
    
    // Auto-save interval (ticks)
    autoSaveInterval: 600, // Every 60 seconds
    ticksSinceLastSave: 0,
    
    // Settings
    settings: {
        animations: true,
        floatingNumbers: true
    },

    // Initialize
    init() {
        this.ticksSinceLastSave = 0;
        this.loadSettings();
    },

    // Create save data object
    createSaveData() {
        return {
            version: 1,
            timestamp: Date.now(),
            resources: Resources.getSaveData(),
            buildings: Buildings.getSaveData(),
            population: Population.getSaveData(),
            hotSprings: HotSprings.getSaveData(),
            seasons: Seasons.getSaveData(),
            research: Research.getSaveData(),
            visitors: Visitors.getSaveData(),
            prestige: Prestige.getSaveData(),
            settings: this.settings
        };
    },

    // Save game to localStorage
    save() {
        try {
            const saveData = this.createSaveData();
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, saveString);
            this.ticksSinceLastSave = 0;
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            Game.log('Failed to save game!', 'warning');
            return false;
        }
    },

    // Load game from localStorage
    load() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) {
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            this.applySaveData(saveData);
            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            Game.log('Failed to load save!', 'warning');
            return false;
        }
    },

    // Apply loaded save data
    applySaveData(saveData) {
        if (saveData.resources) {
            Resources.loadSaveData(saveData.resources);
        }
        if (saveData.buildings) {
            Buildings.loadSaveData(saveData.buildings);
        }
        if (saveData.population) {
            Population.loadSaveData(saveData.population);
        }
        if (saveData.hotSprings) {
            HotSprings.loadSaveData(saveData.hotSprings);
        }
        if (saveData.seasons) {
            Seasons.loadSaveData(saveData.seasons);
        }
        if (saveData.research) {
            Research.loadSaveData(saveData.research);
        }
        if (saveData.visitors) {
            Visitors.loadSaveData(saveData.visitors);
        }
        if (saveData.prestige) {
            Prestige.loadSaveData(saveData.prestige);
        }
        if (saveData.settings) {
            this.settings = { ...this.settings, ...saveData.settings };
            this.applySettings();
        }
        
        // Recalculate derived values
        Resources.recalculateRates();
        Population.updateMaxPopulation();
    },

    // Export save as base64 string
    exportSave() {
        try {
            const saveData = this.createSaveData();
            const saveString = JSON.stringify(saveData);
            const base64 = btoa(unescape(encodeURIComponent(saveString)));
            
            // Copy to clipboard
            navigator.clipboard.writeText(base64).then(() => {
                Game.log('Save exported to clipboard!', 'success');
            }).catch(() => {
                // Fallback: show in prompt
                prompt('Copy your save data:', base64);
            });
            
            return base64;
        } catch (e) {
            console.error('Failed to export save:', e);
            Game.log('Failed to export save!', 'warning');
            return null;
        }
    },

    // Import save from base64 string
    importSave(base64String) {
        try {
            const saveString = decodeURIComponent(escape(atob(base64String.trim())));
            const saveData = JSON.parse(saveString);
            
            // Validate save data
            if (!saveData.version || !saveData.timestamp) {
                throw new Error('Invalid save data');
            }
            
            this.applySaveData(saveData);
            this.save(); // Save to localStorage
            
            Game.log('Save imported successfully!', 'success');
            UI.updateAll();
            
            return true;
        } catch (e) {
            console.error('Failed to import save:', e);
            Game.log('Failed to import save! Invalid data.', 'warning');
            return false;
        }
    },

    // Reset game (delete save)
    resetGame() {
        if (confirm('Are you sure you want to reset? This will delete all progress!')) {
            localStorage.removeItem(this.saveKey);
            location.reload();
        }
    },

    // Auto-save check
    tick() {
        this.ticksSinceLastSave++;
        if (this.ticksSinceLastSave >= this.autoSaveInterval) {
            this.save();
        }
    },

    // Has save data?
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    },

    // Settings management
    loadSettings() {
        try {
            const settingsStr = localStorage.getItem('capysGame_settings');
            if (settingsStr) {
                this.settings = { ...this.settings, ...JSON.parse(settingsStr) };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        this.applySettings();
    },

    saveSettings() {
        try {
            localStorage.setItem('capysGame_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    },

    applySettings() {
        // Apply animation setting
        if (this.settings.animations) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    },

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    },

    getSetting(key) {
        return this.settings[key];
    }
};


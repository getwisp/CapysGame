// Capys Game - Visitor Animals System

const Visitors = {
    // Visitor definitions
    types: {
        ducks: {
            name: 'Ducks',
            icon: '🦆',
            bonus: { type: 'production', resource: 'reeds', amount: 0.1 },
            happinessBonus: 2,
            attractedBy: ['fishingPond'],
            rarity: 1, // Common
            stayDuration: 3000, // 5 minutes
            description: '+10% Reed gathering'
        },
        turtles: {
            name: 'Turtles',
            icon: '🐢',
            bonus: { type: 'allProduction', amount: 0.05 },
            happinessBonus: 3,
            attractedBy: ['naturalSpring', 'expandedPool', 'bathhouse', 'grandOnsen'],
            rarity: 2, // Uncommon
            stayDuration: 4000,
            description: '+5% all production'
        },
        birds: {
            name: 'Birds',
            icon: '🐦',
            bonus: { type: 'weatherForecast' },
            happinessBonus: 2,
            attractedBy: ['riversideGrove'],
            rarity: 1,
            stayDuration: 2000,
            description: 'Weather forecasting'
        },
        monkeys: {
            name: 'Monkeys',
            icon: '🐒',
            bonus: { type: 'production', resource: 'science', amount: 0.2 },
            happinessBonus: 5,
            attractedBy: ['councilCircle', 'observatory'],
            rarity: 3, // Rare
            stayDuration: 3500,
            description: '+20% Science'
        },
        butterflies: {
            name: 'Butterflies',
            icon: '🦋',
            bonus: { type: 'happiness', amount: 15 },
            happinessBonus: 10,
            attractedBy: ['herbGarden'],
            rarity: 2,
            stayDuration: 1500,
            description: '+15 Happiness'
        },
        caimans: {
            name: 'Caimans',
            icon: '🐊',
            bonus: { type: 'production', resource: 'fish', amount: 0.15 },
            happinessBonus: -2, // A bit scary
            attractedBy: ['fishingPond', 'tradingPost'],
            rarity: 4, // Very rare
            stayDuration: 5000,
            description: '+15% Fish (scary but friends)'
        },
        frogs: {
            name: 'Frogs',
            icon: '🐸',
            bonus: { type: 'production', resource: 'herbs', amount: 0.1 },
            happinessBonus: 3,
            attractedBy: ['herbGarden', 'fishingPond'],
            rarity: 1,
            stayDuration: 2500,
            description: '+10% Herbs'
        },
        rabbits: {
            name: 'Rabbits',
            icon: '🐰',
            bonus: { type: 'production', resource: 'grass', amount: 0.1 },
            happinessBonus: 5,
            attractedBy: ['grassPile', 'wovenLodge'],
            rarity: 1,
            stayDuration: 2000,
            description: '+10% Grass'
        },
        owls: {
            name: 'Owls',
            icon: '🦉',
            bonus: { type: 'nightBonus', amount: 0.3 },
            happinessBonus: 4,
            attractedBy: ['councilCircle', 'observatory'],
            rarity: 3,
            stayDuration: 3000,
            description: '+30% night productivity'
        },
        hippos: {
            name: 'Hippos',
            icon: '🦛',
            bonus: { type: 'storageBonus', amount: 0.25 },
            happinessBonus: 4,
            attractedBy: ['fishingPond', 'expandedPool', 'bathhouse', 'grandOnsen'],
            rarity: 3,
            stayDuration: 4500,
            description: '+25% storage capacity'
        },
        cats: {
            name: 'Cats',
            icon: '🐱',
            bonus: { type: 'allProduction', amount: 0.12 },
            happinessBonus: 6,
            attractedBy: ['wovenLodge', 'woodenLonghouse', 'stoneManor', 'bathhouse'],
            rarity: 2,
            stayDuration: 3500,
            description: '+12% all production'
        }
    },

    // Currently visiting animals
    currentVisitors: [],

    // Visitor history (species encountered)
    encountered: {},

    // Initialize
    init() {
        this.currentVisitors = [];
        this.encountered = {};
    },

    // Check if a visitor type can spawn
    canSpawn(visitorId) {
        const visitor = this.types[visitorId];
        if (!visitor) return false;
        
        // Check if already visiting
        if (this.currentVisitors.some(v => v.id === visitorId)) return false;
        
        // Check if attracted by any buildings
        for (const buildingId of visitor.attractedBy) {
            if (Buildings.getCount(buildingId) > 0) {
                return true;
            }
        }
        
        return false;
    },

    // Try to spawn a random visitor
    trySpawnVisitor() {
        const possibleVisitors = [];
        
        for (const [id, visitor] of Object.entries(this.types)) {
            if (this.canSpawn(id)) {
                // Add based on rarity (lower rarity = more likely)
                const weight = 5 - visitor.rarity;
                for (let i = 0; i < weight; i++) {
                    possibleVisitors.push(id);
                }
            }
        }
        
        if (possibleVisitors.length === 0) return null;
        
        // Pick random visitor
        const visitorId = possibleVisitors[Math.floor(Math.random() * possibleVisitors.length)];
        return this.spawnVisitor(visitorId);
    },

    // Spawn a specific visitor
    spawnVisitor(visitorId) {
        const visitorType = this.types[visitorId];
        if (!visitorType) return null;
        
        // Calculate stay duration with research bonus
        const duration = Math.floor(visitorType.stayDuration * Research.bonuses.visitorDuration);
        
        const visitor = {
            id: visitorId,
            ...visitorType,
            arrivalTime: Date.now(),
            departureTime: Date.now() + duration * 100, // Convert ticks to ms
            ticksRemaining: duration
        };
        
        this.currentVisitors.push(visitor);
        
        // Mark as encountered
        this.encountered[visitorId] = true;
        
        // Log message
        Game.log(`${visitorType.icon} A ${visitorType.name} has arrived!`, 'event');
        
        // Apply bonuses
        this.applyBonuses();
        
        return visitor;
    },

    // Remove a visitor
    removeVisitor(visitorId) {
        const index = this.currentVisitors.findIndex(v => v.id === visitorId);
        if (index === -1) return;
        
        const visitor = this.currentVisitors[index];
        this.currentVisitors.splice(index, 1);
        
        Game.log(`${visitor.icon} The ${visitor.name} has left.`, 'event');
        
        // Recalculate bonuses
        this.applyBonuses();
    },

    // Get current visitor count
    getVisitorCount() {
        return this.currentVisitors.length;
    },

    // Get total happiness bonus from visitors
    getHappinessBonus() {
        let bonus = 0;
        for (const visitor of this.currentVisitors) {
            bonus += visitor.happinessBonus || 0;
        }
        // Apply research bonus
        return bonus * Research.bonuses.visitorBonus;
    },

    // Apply production bonuses from visitors
    applyBonuses() {
        // This is called when calculating resource rates
        // The actual application happens in Resources.recalculateRates
    },

    // Get production multiplier for a resource
    getProductionMultiplier(resourceId) {
        let multiplier = 1;
        
        for (const visitor of this.currentVisitors) {
            if (visitor.bonus.type === 'production' && visitor.bonus.resource === resourceId) {
                multiplier += visitor.bonus.amount * Research.bonuses.visitorBonus;
            }
            if (visitor.bonus.type === 'allProduction') {
                multiplier += visitor.bonus.amount * Research.bonuses.visitorBonus;
            }
        }
        
        return multiplier;
    },

    // Check for night bonus from owls
    getNightBonus() {
        for (const visitor of this.currentVisitors) {
            if (visitor.bonus.type === 'nightBonus' && Seasons.isNight()) {
                return 1 + visitor.bonus.amount;
            }
        }
        return 1;
    },
    
    // Check if birds are visiting (for weather forecast)
    hasBirdsVisiting() {
        return this.currentVisitors.some(v => v.id === 'birds');
    },
    
    // Get weather forecast (only works if birds are visiting)
    getWeatherForecast() {
        if (!this.hasBirdsVisiting()) return null;
        return Seasons.forecastNextWeather();
    },
    
    // Get extra happiness from bonus type 'happiness' (e.g., Butterflies)
    getExtraHappinessBonus() {
        let bonus = 0;
        for (const visitor of this.currentVisitors) {
            if (visitor.bonus.type === 'happiness') {
                bonus += visitor.bonus.amount * Research.bonuses.visitorBonus;
            }
        }
        return bonus;
    },
    
    // Get storage capacity multiplier (e.g., Hippos)
    getStorageMultiplier() {
        let multiplier = 1;
        for (const visitor of this.currentVisitors) {
            if (visitor.bonus.type === 'storageBonus') {
                multiplier += visitor.bonus.amount * Research.bonuses.visitorBonus;
            }
        }
        return multiplier;
    },

    // Process tick
    tick() {
        // Update visitor timers
        for (let i = this.currentVisitors.length - 1; i >= 0; i--) {
            this.currentVisitors[i].ticksRemaining--;
            if (this.currentVisitors[i].ticksRemaining <= 0) {
                this.removeVisitor(this.currentVisitors[i].id);
            }
        }
    },

    // Get current visitors for UI
    getCurrentVisitors() {
        return this.currentVisitors.map(v => ({
            ...v,
            timeRemaining: Math.ceil(v.ticksRemaining / 10) // seconds
        }));
    },

    // Get encountered species for UI
    getEncounteredSpecies() {
        const species = [];
        for (const id of Object.keys(this.encountered)) {
            species.push({
                id,
                ...this.types[id]
            });
        }
        return species;
    },

    // Get count of unique species encountered
    getEncounteredCount() {
        return Object.keys(this.encountered).length;
    },

    // Export state for saving
    getSaveData() {
        return {
            currentVisitors: this.currentVisitors.map(v => ({
                id: v.id,
                ticksRemaining: v.ticksRemaining
            })),
            encountered: { ...this.encountered }
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.encountered) {
            this.encountered = { ...data.encountered };
        }
        
        if (data.currentVisitors) {
            this.currentVisitors = [];
            for (const saved of data.currentVisitors) {
                const visitorType = this.types[saved.id];
                if (visitorType) {
                    this.currentVisitors.push({
                        id: saved.id,
                        ...visitorType,
                        ticksRemaining: saved.ticksRemaining
                    });
                }
            }
        }
    }
};


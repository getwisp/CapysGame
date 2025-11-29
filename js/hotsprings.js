// Capys Game - Hot Springs System

const HotSprings = {
    // Current warmth level (0-100)
    warmth: 50,
    maxWarmth: 100,
    
    // Active springs
    springs: [],
    
    // Capybaras currently soaking
    soaking: [],
    
    // Soak timer (ticks until they leave)
    soakDuration: 100, // 10 seconds at 10 ticks/sec
    
    // Relaxation buff duration
    relaxationDuration: 200, // 20 seconds
    
    // Capybaras with active relaxation buff
    relaxed: {}, // { capyId: ticksRemaining }

    // Initialize
    init() {
        this.warmth = 50;
        this.springs = [];
        this.soaking = [];
        this.relaxed = {};
    },

    // Add a new hot spring
    addSpring(config) {
        const spring = {
            id: 'spring_' + this.springs.length,
            type: config.type || 'natural',
            capacity: config.capacity || 2,
            warmthGeneration: config.warmth || 5,
            weatherProtected: config.weatherProtected || false,
            currentOccupants: []
        };
        
        this.springs.push(spring);
        
        // Update max warmth
        this.maxWarmth = Math.min(100, 50 + this.springs.length * 10);
        
        // Unlock spring keeper job if first spring
        if (this.springs.length === 1) {
            Population.unlockJob('springKeeper');
        }
        
        return spring;
    },

    // Get total warmth generation
    getWarmthGeneration() {
        let generation = 0;
        
        for (const spring of this.springs) {
            let springWarmth = spring.warmthGeneration;
            
            // Weather effects (if not protected)
            if (!spring.weatherProtected) {
                const weather = Seasons.getCurrentWeather();
                if (weather === 'rain') springWarmth *= 0.8;
                if (weather === 'coldSnap') springWarmth *= 0.5;
                if (weather === 'heatWave') springWarmth *= 0.7;
            }
            
            generation += springWarmth;
        }
        
        // Spring keeper bonus
        const keepers = Population.getJobCount('springKeeper');
        generation *= (1 + keepers * 0.1);
        
        // Research bonus: Steam Engineering (+50% warmth)
        if (Research.bonuses.warmthBonus) {
            generation *= (1 + Research.bonuses.warmthBonus);
        }
        
        return generation;
    },

    // Get warmth consumption
    getWarmthConsumption() {
        const pop = Population.getTotal();
        let consumption = pop * 0.3; // Base consumption per capybara
        
        // Season effects
        const season = Seasons.getCurrentSeason();
        if (season === 'winter') consumption *= 2;
        if (season === 'autumn') consumption *= 1.3;
        if (season === 'summer') consumption *= 0.7;
        
        // Night increases consumption
        if (Seasons.isNight()) consumption *= 1.5;
        
        // Weather effects
        const weather = Seasons.getCurrentWeather();
        if (weather === 'coldSnap') consumption *= 2;
        if (weather === 'sunny') consumption *= 0.8;
        
        return consumption;
    },

    // Get current warmth as percentage
    getWarmthPercent() {
        return Math.round((this.warmth / this.maxWarmth) * 100);
    },

    // Get total soak capacity
    getTotalCapacity() {
        let baseCapacity = this.springs.reduce((sum, s) => sum + s.capacity, 0);
        
        // Research bonus: Pool Expansion (+2 per spring)
        if (Research.bonuses.springCapacity && this.springs.length > 0) {
            baseCapacity += Research.bonuses.springCapacity * this.springs.length;
        }
        
        return baseCapacity;
    },

    // Get current soaking count
    getSoakingCount() {
        return this.soaking.length;
    },

    // Get available soak slots
    getAvailableSlots() {
        return this.getTotalCapacity() - this.getSoakingCount();
    },

    // Add a capybara to soak
    startSoaking(capyId) {
        if (this.getAvailableSlots() <= 0) return false;
        if (this.soaking.includes(capyId)) return false;
        
        // Find a spring with space
        for (const spring of this.springs) {
            if (spring.currentOccupants.length < spring.capacity) {
                spring.currentOccupants.push(capyId);
                this.soaking.push({
                    id: capyId,
                    springId: spring.id,
                    ticksRemaining: this.soakDuration
                });
                return true;
            }
        }
        
        return false;
    },

    // Remove a capybara from soaking
    stopSoaking(capyId) {
        const index = this.soaking.findIndex(s => s.id === capyId);
        if (index === -1) return false;
        
        const soakData = this.soaking[index];
        
        // Remove from spring
        for (const spring of this.springs) {
            const occIndex = spring.currentOccupants.indexOf(capyId);
            if (occIndex !== -1) {
                spring.currentOccupants.splice(occIndex, 1);
                break;
            }
        }
        
        // Remove from soaking list
        this.soaking.splice(index, 1);
        
        // Grant relaxation buff (with research bonus)
        let duration = this.relaxationDuration;
        if (Research.bonuses.relaxationDuration) {
            duration *= Research.bonuses.relaxationDuration;
        }
        this.relaxed[capyId] = duration;
        
        return true;
    },

    // Check if capybara has relaxation buff
    hasRelaxationBuff(capyId) {
        return this.relaxed[capyId] && this.relaxed[capyId] > 0;
    },

    // Get productivity bonus from relaxation
    getRelaxationBonus() {
        const relaxedCount = Object.values(this.relaxed).filter(t => t > 0).length;
        const totalWorkers = Population.adults - Population.getIdle();
        
        if (totalWorkers <= 0) return 1;
        
        // Each relaxed worker gives 25% bonus
        const bonusWorkers = Math.min(relaxedCount, totalWorkers);
        return 1 + (bonusWorkers / totalWorkers) * 0.25;
    },

    // Get productivity penalty from cold
    getWarmthProductivity() {
        const percent = this.getWarmthPercent();
        
        if (percent >= 70) {
            // Bonus up to 50%
            return 1 + (percent - 70) / 60; // Max 1.5 at 100%
        } else if (percent < 30) {
            // Penalty up to 75%
            return 0.25 + (percent / 30) * 0.75; // Min 0.25 at 0%
        }
        
        return 1;
    },

    // Process hot springs tick
    tick() {
        // Calculate warmth change
        const generation = this.getWarmthGeneration();
        const consumption = this.getWarmthConsumption();
        const netChange = (generation - consumption) * 0.1;
        
        this.warmth = Math.max(0, Math.min(this.maxWarmth, this.warmth + netChange));
        
        // Update soaking timers
        for (let i = this.soaking.length - 1; i >= 0; i--) {
            this.soaking[i].ticksRemaining--;
            if (this.soaking[i].ticksRemaining <= 0) {
                this.stopSoaking(this.soaking[i].id);
            }
        }
        
        // Update relaxation timers
        for (const capyId of Object.keys(this.relaxed)) {
            this.relaxed[capyId]--;
            if (this.relaxed[capyId] <= 0) {
                delete this.relaxed[capyId];
            }
        }
        
        // Auto-rotate capybaras into springs
        this.autoRotate();
    },

    // Automatically send idle capybaras to soak
    autoRotate() {
        // Only if there are available slots
        if (this.getAvailableSlots() <= 0) return;
        
        // Get idle capybaras (simplified - just count)
        const idleCount = Population.getIdle();
        
        // Send some idle capybaras to soak
        const toSoak = Math.min(idleCount, this.getAvailableSlots());
        
        for (let i = 0; i < toSoak; i++) {
            const capyId = 'capy_' + Date.now() + '_' + i;
            this.startSoaking(capyId);
        }
    },

    // Get springs data for UI
    getSprings() {
        return this.springs.map(spring => ({
            ...spring,
            occupancy: spring.currentOccupants.length
        }));
    },

    // Get spring type display name
    getSpringTypeName(type) {
        const names = {
            natural: 'Natural Spring',
            expanded: 'Expanded Pool',
            bathhouse: 'Bathhouse',
            grand: 'Grand Onsen'
        };
        return names[type] || type;
    },

    // Export state for saving
    getSaveData() {
        return {
            warmth: this.warmth,
            maxWarmth: this.maxWarmth,
            springs: this.springs.map(s => ({
                type: s.type,
                capacity: s.capacity,
                warmthGeneration: s.warmthGeneration,
                weatherProtected: s.weatherProtected
            }))
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.warmth !== undefined) this.warmth = data.warmth;
        if (data.maxWarmth !== undefined) this.maxWarmth = data.maxWarmth;
        
        if (data.springs) {
            this.springs = [];
            for (const springData of data.springs) {
                this.addSpring(springData);
            }
        }
    }
};


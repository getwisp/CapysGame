// Capys Game - Population System

const Population = {
    // Population data
    adults: 2,
    pups: 0,
    maxPopulation: 4,
    
    // Growth tracking
    growthProgress: 0,
    growthThreshold: 100,
    
    // Job definitions
    jobs: {
        grazer: {
            name: 'Grazer',
            icon: '🌿',
            description: 'Gathers grass',
            produces: { grass: 0.5 },
            unlocked: true
        },
        gatherer: {
            name: 'Gatherer',
            icon: '🌾',
            description: 'Gathers reeds',
            produces: { reeds: 0.3 },
            unlocked: true
        },
        digger: {
            name: 'Digger',
            icon: '⛏️',
            description: 'Digs clay from pits',
            produces: { clay: 0.2 },
            consumes: { grass: 0.1 },
            unlocked: false
        },
        woodgnawer: {
            name: 'Woodgnawer',
            icon: '🪵',
            description: 'Gnaws wood from trees',
            produces: { wood: 0.15 },
            consumes: { grass: 0.1 },
            unlocked: false
        },
        fisher: {
            name: 'Fisher',
            icon: '🐟',
            description: 'Catches fish',
            produces: { fish: 0.1 },
            consumes: { reeds: 0.05 },
            unlocked: false
        },
        quarrier: {
            name: 'Quarrier',
            icon: '⛏️',
            description: 'Mines stone',
            produces: { stone: 0.1 },
            consumes: { grass: 0.1 },
            unlocked: false
        },
        crafter: {
            name: 'Crafter',
            icon: '🧶',
            description: 'Crafts woven mats',
            produces: { mats: 0.1 },
            consumes: { reeds: 0.15 },
            unlocked: false
        },
        potter: {
            name: 'Potter',
            icon: '🏺',
            description: 'Crafts pottery from clay',
            produces: { pottery: 0.1 },
            consumes: { clay: 0.12 },
            unlocked: false
        },
        herbalist: {
            name: 'Herbalist',
            icon: '🌱',
            description: 'Gathers herbs',
            produces: { herbs: 0.1 },
            unlocked: false
        },
        springKeeper: {
            name: 'Spring Keeper',
            icon: '♨️',
            description: 'Maintains hot springs (+warmth)',
            produces: {},
            unlocked: false,
            special: 'warmthBonus'
        },
        healer: {
            name: 'Healer',
            icon: '💚',
            description: 'Heals capybaras, +happiness',
            produces: {},
            consumes: { herbs: 0.05 },
            unlocked: false,
            special: 'happiness'
        },
        elder: {
            name: 'Elder',
            icon: '📚',
            description: 'Generates science',
            produces: { science: 0.2 },
            consumes: { fish: 0.05 },
            unlocked: false
        }
    },

    // Job assignments
    jobCounts: {},

    // Happiness system
    baseHappiness: 50,
    happinessBonuses: {},
    happinessPenalties: {},

    // Initialize population
    init() {
        // Reset all job counts
        for (const id of Object.keys(this.jobs)) {
            this.jobCounts[id] = 0;
        }
        
        // Reset population values
        this.adults = 2;
        this.pups = 0;
        this.maxPopulation = 4;
        this.growthProgress = 0;
        
        // Reset happiness modifiers
        this.happinessBonuses = {};
        this.happinessPenalties = {};
        
        // Reset job unlock states (keep grazer and gatherer)
        for (const [id, job] of Object.entries(this.jobs)) {
            job.unlocked = (id === 'grazer' || id === 'gatherer');
        }
    },

    // Get total population
    getTotal() {
        return this.adults + this.pups;
    },

    // Get idle (unassigned) adults
    getIdle() {
        let assigned = 0;
        for (const count of Object.values(this.jobCounts)) {
            assigned += count;
        }
        return Math.max(0, this.adults - assigned);
    },

    // Get assigned count for a job
    getJobCount(jobId) {
        return this.jobCounts[jobId] || 0;
    },

    // Assign a capybara to a job
    assignJob(jobId) {
        const job = this.jobs[jobId];
        if (!job || !job.unlocked) return false;
        
        if (this.getIdle() <= 0) return false;
        
        this.jobCounts[jobId] = (this.jobCounts[jobId] || 0) + 1;
        Resources.recalculateRates();
        return true;
    },

    // Unassign a capybara from a job
    unassignJob(jobId) {
        if (!this.jobCounts[jobId] || this.jobCounts[jobId] <= 0) return false;
        
        this.jobCounts[jobId]--;
        Resources.recalculateRates();
        return true;
    },

    // Unlock a job
    unlockJob(jobId) {
        if (this.jobs[jobId]) {
            this.jobs[jobId].unlocked = true;
        }
    },

    // Add housing capacity
    addHousing(amount) {
        this.maxPopulation += amount;
    },

    // Set max population based on buildings
    updateMaxPopulation() {
        this.maxPopulation = Buildings.getTotalHousing();
    },

    // Add happiness bonus
    addHappinessBonus(source, amount) {
        this.happinessBonuses[source] = amount;
    },

    // Add happiness penalty
    addHappinessPenalty(source, amount) {
        this.happinessPenalties[source] = amount;
    },

    // Remove happiness modifier
    removeHappinessModifier(source) {
        delete this.happinessBonuses[source];
        delete this.happinessPenalties[source];
    },

    // Calculate current happiness
    calculateHappiness() {
        let happiness = this.baseHappiness;
        
        // Only add PERSISTENT bonuses (from buildings, research, etc.)
        // Dynamic bonuses are calculated below and shouldn't be double-counted
        const dynamicBonusKeys = ['warmth', 'visitors', 'healers'];
        const dynamicPenaltyKeys = ['overcrowding', 'foodShortage', 'cold'];
        
        for (const [key, bonus] of Object.entries(this.happinessBonuses)) {
            if (!dynamicBonusKeys.includes(key)) {
                happiness += bonus;
            }
        }
        
        for (const [key, penalty] of Object.entries(this.happinessPenalties)) {
            if (!dynamicPenaltyKeys.includes(key)) {
                happiness -= penalty;
            }
        }
        
        // Overcrowding penalty
        const overcrowding = this.getTotal() - this.maxPopulation;
        if (overcrowding > 0) {
            happiness -= overcrowding * 5;
            this.happinessPenalties.overcrowding = overcrowding * 5;
        } else {
            delete this.happinessPenalties.overcrowding;
        }
        
        // Food shortage penalty
        if (Resources.get('grass') < this.getTotal() * 2) {
            const shortage = Math.floor((this.getTotal() * 2 - Resources.get('grass')) / 2);
            happiness -= shortage * 3;
            this.happinessPenalties.foodShortage = shortage * 3;
        } else {
            delete this.happinessPenalties.foodShortage;
        }
        
        // Hot spring bonus/penalty - cleanup old values first
        delete this.happinessBonuses.warmth;
        delete this.happinessPenalties.cold;
        
        const warmth = HotSprings.getWarmthPercent();
        if (warmth > 70) {
            const warmthBonus = Math.floor((warmth - 70) / 10) * 2;
            happiness += warmthBonus;
            this.happinessBonuses.warmth = warmthBonus;
        } else if (warmth < 30) {
            const coldPenalty = Math.floor((30 - warmth) / 10) * 3;
            happiness -= coldPenalty;
            this.happinessPenalties.cold = coldPenalty;
        }
        
        // Visitor bonuses - cleanup old values first
        delete this.happinessBonuses.visitors;
        delete this.happinessBonuses.butterflies;
        
        const visitorBonus = Visitors.getHappinessBonus();
        if (visitorBonus > 0) {
            happiness += visitorBonus;
            this.happinessBonuses.visitors = visitorBonus;
        }
        
        // Extra happiness from visitors with 'happiness' bonus type (Butterflies)
        const extraHappiness = Visitors.getExtraHappinessBonus();
        if (extraHappiness > 0) {
            happiness += extraHappiness;
            this.happinessBonuses.butterflies = extraHappiness;
        }
        
        // Healer bonus - cleanup old value first
        delete this.happinessBonuses.healers;
        
        const healers = this.getJobCount('healer');
        if (healers > 0) {
            happiness += healers * 3;
            this.happinessBonuses.healers = healers * 3;
        }
        
        // Clamp
        return Math.max(0, Math.min(100, happiness));
    },

    // Get happiness factors for UI
    getHappinessFactors() {
        const factors = [];
        
        factors.push({ name: 'Base', value: this.baseHappiness });
        
        for (const [source, value] of Object.entries(this.happinessBonuses)) {
            factors.push({ name: this.formatFactorName(source), value: value, positive: true });
        }
        
        for (const [source, value] of Object.entries(this.happinessPenalties)) {
            factors.push({ name: this.formatFactorName(source), value: -value, positive: false });
        }
        
        return factors;
    },

    // Format factor name for display
    formatFactorName(source) {
        const names = {
            overcrowding: 'Overcrowding',
            foodShortage: 'Food Shortage',
            warmth: 'Warm & Cozy',
            cold: 'Too Cold',
            visitors: 'Animal Friends',
            butterflies: 'Butterfly Joy',
            healers: 'Healer Care'
        };
        
        if (names[source]) return names[source];
        if (source.startsWith('building_')) {
            const buildingId = source.replace('building_', '');
            return Buildings.types[buildingId]?.name || source;
        }
        return source;
    },

    // Process population growth
    tick() {
        const happiness = this.calculateHappiness();
        const grassSurplus = Resources.get('grass') - (this.getTotal() * 5);
        
        // Growth rate based on happiness and food
        let growthRate = 0.1; // Base rate
        
        if (happiness > 50) {
            growthRate += (happiness - 50) * 0.01;
        } else {
            growthRate -= (50 - happiness) * 0.02;
        }
        
        if (grassSurplus > 0) {
            growthRate += Math.min(grassSurplus / 50, 0.1);
        }
        
        // Can't grow if at max
        if (this.getTotal() >= this.maxPopulation) {
            growthRate = 0;
        }
        
        // Apply growth
        if (growthRate > 0) {
            this.growthProgress += growthRate;
            
            if (this.growthProgress >= this.growthThreshold) {
                this.growthProgress = 0;
                this.addPup();
            }
        }
        
        // Pup maturation
        if (this.pups > 0 && Math.random() < 0.001) {
            this.maturePup();
        }
    },

    // Add a new pup
    addPup() {
        if (this.getTotal() < this.maxPopulation) {
            this.pups++;
            Game.log('🎉 A new pup was born!', 'success');
        }
    },

    // Mature a pup into an adult
    maturePup() {
        if (this.pups > 0) {
            this.pups--;
            this.adults++;
            Game.log('🐹 A pup has grown into an adult!', 'success');
        }
    },

    // Get growth progress percentage
    getGrowthProgress() {
        return Math.min(100, (this.growthProgress / this.growthThreshold) * 100);
    },

    // Get unlocked jobs for UI
    getJobs() {
        const jobs = [];
        
        for (const [id, job] of Object.entries(this.jobs)) {
            if (job.unlocked) {
                jobs.push({
                    id,
                    ...job,
                    count: this.getJobCount(id)
                });
            }
        }
        
        return jobs;
    },

    // Export state for saving
    getSaveData() {
        return {
            adults: this.adults,
            pups: this.pups,
            maxPopulation: this.maxPopulation,
            growthProgress: this.growthProgress,
            jobCounts: { ...this.jobCounts },
            happinessBonuses: { ...this.happinessBonuses },
            unlockedJobs: Object.fromEntries(
                Object.entries(this.jobs)
                    .filter(([_, j]) => j.unlocked)
                    .map(([id, _]) => [id, true])
            )
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.adults !== undefined) this.adults = data.adults;
        if (data.pups !== undefined) this.pups = data.pups;
        if (data.maxPopulation !== undefined) this.maxPopulation = data.maxPopulation;
        if (data.growthProgress !== undefined) this.growthProgress = data.growthProgress;
        
        if (data.jobCounts) {
            for (const [id, count] of Object.entries(data.jobCounts)) {
                if (this.jobCounts.hasOwnProperty(id)) {
                    this.jobCounts[id] = count;
                }
            }
        }
        
        if (data.happinessBonuses) {
            this.happinessBonuses = { ...data.happinessBonuses };
        }
        
        if (data.unlockedJobs) {
            for (const id of Object.keys(data.unlockedJobs)) {
                if (this.jobs[id]) {
                    this.jobs[id].unlocked = true;
                }
            }
        }
    }
};


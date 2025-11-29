// Capys Game - Resource Management System

const Resources = {
    // Resource definitions
    types: {
        // Primary Resources
        grass: {
            name: 'Grass',
            icon: '🌿',
            baseMax: 100,
            visible: true,
            category: 'primary'
        },
        reeds: {
            name: 'Reeds',
            icon: '🌾',
            baseMax: 50,
            visible: true,
            category: 'primary'
        },
        clay: {
            name: 'Clay',
            icon: '🏺',
            baseMax: 50,
            visible: false,
            category: 'primary'
        },
        wood: {
            name: 'Wood',
            icon: '🪵',
            baseMax: 50,
            visible: false,
            category: 'primary'
        },
        fish: {
            name: 'Fish',
            icon: '🐟',
            baseMax: 25,
            visible: false,
            category: 'primary'
        },
        stone: {
            name: 'Stone',
            icon: '🪨',
            baseMax: 50,
            visible: false,
            category: 'primary'
        },
        // Crafted Resources
        mats: {
            name: 'Woven Mats',
            icon: '🧶',
            baseMax: 20,
            visible: false,
            category: 'crafted'
        },
        pottery: {
            name: 'Pottery',
            icon: '🫖',
            baseMax: 20,
            visible: false,
            category: 'crafted'
        },
        herbs: {
            name: 'Herbal Mix',
            icon: '🌿',
            baseMax: 10,
            visible: false,
            category: 'crafted'
        },
        // Special Resources
        science: {
            name: 'Science',
            icon: '📚',
            baseMax: 100,
            visible: false,
            category: 'special'
        }
    },

    // Current resource values
    amounts: {},
    
    // Current max storage
    maxStorage: {},
    
    // Production rates per tick (calculated)
    production: {},
    
    // Consumption rates per tick (calculated)
    consumption: {},

    // Initialize resources
    init() {
        for (const [id, resource] of Object.entries(this.types)) {
            this.amounts[id] = 0;
            this.maxStorage[id] = resource.baseMax;
            this.production[id] = 0;
            this.consumption[id] = 0;
        }
        
        // Start with some grass
        this.amounts.grass = 10;
    },

    // Get current amount of a resource
    get(resourceId) {
        return this.amounts[resourceId] || 0;
    },

    // Get max storage for a resource (with visitor and research bonuses)
    getMax(resourceId) {
        const baseMax = this.maxStorage[resourceId] || 0;
        // Apply storage multipliers from visitors (e.g., Hippos) and research
        const visitorMultiplier = Visitors.getStorageMultiplier();
        const researchMultiplier = 1 + (Research.bonuses.storageMultiplier || 0);
        const totalMultiplier = visitorMultiplier * researchMultiplier;
        return Math.floor(baseMax * totalMultiplier);
    },

    // Check if we can afford a cost
    canAfford(costs) {
        for (const [resourceId, amount] of Object.entries(costs)) {
            if (this.get(resourceId) < amount) {
                return false;
            }
        }
        return true;
    },

    // Spend resources (returns true if successful)
    spend(costs) {
        if (!this.canAfford(costs)) {
            return false;
        }
        
        for (const [resourceId, amount] of Object.entries(costs)) {
            this.amounts[resourceId] -= amount;
        }
        return true;
    },

    // Add resources (respects max storage)
    add(resourceId, amount) {
        if (!this.amounts.hasOwnProperty(resourceId)) return 0;
        
        const max = this.getMax(resourceId);
        const current = this.amounts[resourceId];
        const newAmount = Math.min(current + amount, max);
        const actualAdded = newAmount - current;
        
        this.amounts[resourceId] = newAmount;
        return actualAdded;
    },

    // Remove resources (can't go below 0)
    remove(resourceId, amount) {
        if (!this.amounts.hasOwnProperty(resourceId)) return 0;
        
        const current = this.amounts[resourceId];
        const newAmount = Math.max(current - amount, 0);
        const actualRemoved = current - newAmount;
        
        this.amounts[resourceId] = newAmount;
        return actualRemoved;
    },

    // Set max storage
    setMax(resourceId, newMax) {
        if (this.maxStorage.hasOwnProperty(resourceId)) {
            this.maxStorage[resourceId] = newMax;
            // Cap current amount if over new max
            if (this.amounts[resourceId] > newMax) {
                this.amounts[resourceId] = newMax;
            }
        }
    },

    // Add to max storage
    addMax(resourceId, amount) {
        if (this.maxStorage.hasOwnProperty(resourceId)) {
            this.maxStorage[resourceId] += amount;
        }
    },

    // Make a resource visible
    unlock(resourceId) {
        if (this.types[resourceId]) {
            this.types[resourceId].visible = true;
        }
    },

    // Check if resource is visible
    isVisible(resourceId) {
        return this.types[resourceId]?.visible || false;
    },

    // Calculate net production rate
    getNetRate(resourceId) {
        return (this.production[resourceId] || 0) - (this.consumption[resourceId] || 0);
    },

    // Update production/consumption rates based on jobs and buildings
    recalculateRates() {
        // Reset rates
        for (const id of Object.keys(this.types)) {
            this.production[id] = 0;
            this.consumption[id] = 0;
        }

        // Get productivity multiplier
        const productivity = Game.getProductivity();

        // Calculate from jobs
        for (const [jobId, job] of Object.entries(Population.jobs)) {
            const workers = Population.getJobCount(jobId);
            if (workers > 0 && job.produces) {
                for (const [resId, amount] of Object.entries(job.produces)) {
                    let production = amount * workers * productivity;
                    
                    // Apply research production bonuses
                    const researchBonus = Research.getProductionBonus(resId);
                    if (researchBonus > 0) {
                        production *= (1 + researchBonus);
                    }
                    
                    // Apply visitor production multiplier
                    production *= Visitors.getProductionMultiplier(resId);
                    
                    this.production[resId] += production;
                }
            }
            if (workers > 0 && job.consumes) {
                for (const [resId, amount] of Object.entries(job.consumes)) {
                    this.consumption[resId] += amount * workers;
                }
            }
        }
        
        // Apply science generation bonus from research (Oral Tradition, Writing) and prestige (Elder Wisdom)
        if (this.production.science > 0) {
            let scienceBonus = Research.bonuses.scienceBonus || 0;
            scienceBonus += Prestige.bonuses.scienceBonus || 0;
            if (scienceBonus > 0) {
                this.production.science *= (1 + scienceBonus);
            }
        }
        
        // Apply Observatory science multiplier (+100% = 2x)
        if (this.production.science > 0 && Buildings.getCount('observatory') > 0) {
            const observatory = Buildings.types.observatory;
            if (observatory.effects.scienceMultiplier) {
                this.production.science *= observatory.effects.scienceMultiplier;
            }
        }

        // Calculate from buildings (passive production)
        for (const [buildingId, building] of Object.entries(Buildings.types)) {
            const count = Buildings.getCount(buildingId);
            if (count > 0 && building.production) {
                for (const [resId, amount] of Object.entries(building.production)) {
                    this.production[resId] += amount * count * productivity;
                }
            }
        }

        // Grass consumption from population
        const popCount = Population.getTotal();
        this.consumption.grass += popCount * 0.05; // Each capybara eats 0.05 grass per tick
    },

    // Process one tick of resource production/consumption
    tick() {
        // Apply production
        for (const [id, rate] of Object.entries(this.production)) {
            if (rate > 0) {
                this.add(id, rate);
            }
        }

        // Apply consumption
        for (const [id, rate] of Object.entries(this.consumption)) {
            if (rate > 0) {
                this.remove(id, rate);
            }
        }
    },

    // Get all visible resources
    getVisible() {
        const visible = {};
        for (const [id, resource] of Object.entries(this.types)) {
            if (resource.visible) {
                visible[id] = {
                    ...resource,
                    amount: this.amounts[id],
                    max: this.maxStorage[id],
                    rate: this.getNetRate(id)
                };
            }
        }
        return visible;
    },

    // Manual gathering (click actions)
    gatherGrass() {
        const amount = 1 * Game.getProductivity();
        const added = this.add('grass', amount);
        if (added > 0) {
            UI.showFloatingText(`+${added.toFixed(1)} 🌿`, 'positive');
        }
        return added;
    },

    gatherReeds() {
        const amount = 1 * Game.getProductivity();
        const added = this.add('reeds', amount);
        if (added > 0) {
            UI.showFloatingText(`+${added.toFixed(1)} 🌾`, 'positive');
        }
        return added;
    },

    // Export state for saving
    getSaveData() {
        return {
            amounts: { ...this.amounts },
            maxStorage: { ...this.maxStorage },
            visible: Object.fromEntries(
                Object.entries(this.types)
                    .filter(([_, r]) => r.visible)
                    .map(([id, _]) => [id, true])
            )
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.amounts) {
            for (const [id, amount] of Object.entries(data.amounts)) {
                if (this.amounts.hasOwnProperty(id)) {
                    this.amounts[id] = amount;
                }
            }
        }
        if (data.maxStorage) {
            for (const [id, max] of Object.entries(data.maxStorage)) {
                if (this.maxStorage.hasOwnProperty(id)) {
                    this.maxStorage[id] = max;
                }
            }
        }
        if (data.visible) {
            for (const id of Object.keys(data.visible)) {
                if (this.types[id]) {
                    this.types[id].visible = true;
                }
            }
        }
    }
};


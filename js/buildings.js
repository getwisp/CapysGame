// Capys Game - Buildings System

const Buildings = {
    // Building definitions
    types: {
        // Tier 1 - Settlement
        grassPile: {
            name: 'Grass Pile',
            icon: '🌿',
            description: '+50 Grass storage',
            category: 'storage',
            tier: 1,
            cost: {},
            costMultiplier: 1,
            effects: {
                storage: { grass: 50 }
            },
            unlocked: true,
            max: 10
        },
        reedBundle: {
            name: 'Reed Bundle',
            icon: '🌾',
            description: '+30 Reeds storage',
            category: 'storage',
            tier: 1,
            cost: { grass: 10 },
            costMultiplier: 1.1,
            effects: {
                storage: { reeds: 30 }
            },
            unlocked: true,
            max: 10
        },
        reedShelter: {
            name: 'Reed Shelter',
            icon: '🏚️',
            description: '+2 Housing',
            category: 'housing',
            tier: 1,
            cost: { reeds: 10 },
            costMultiplier: 1.15,
            effects: {
                housing: 2
            },
            unlocked: true,
            max: 10
        },
        clayPit: {
            name: 'Clay Pit',
            icon: '🕳️',
            description: 'Unlocks Digger job, +30 Clay storage',
            category: 'production',
            tier: 1,
            cost: { reeds: 15 },
            costMultiplier: 1.2,
            effects: {
                unlock: ['clay', 'digger'],
                storage: { clay: 30 }
            },
            unlocked: true,
            max: 5
        },
        
        // Tier 2 - Village
        wovenLodge: {
            name: 'Woven Lodge',
            icon: '🏠',
            description: '+5 Housing, comfort bonus',
            category: 'housing',
            tier: 2,
            cost: { reeds: 20, clay: 10 },
            costMultiplier: 1.15,
            effects: {
                housing: 5,
                happiness: 2
            },
            requires: { clayPit: 1 },
            unlocked: false,
            max: 10
        },
        workshop: {
            name: 'Workshop',
            icon: '🔨',
            description: 'Unlocks Crafter job',
            category: 'production',
            tier: 2,
            cost: { reeds: 30, clay: 20 },
            costMultiplier: 1.3,
            effects: {
                unlock: ['crafter', 'mats']
            },
            requires: { clayPit: 1 },
            unlocked: false,
            max: 3
        },
        expandedPool: {
            name: 'Expanded Pool',
            icon: '♨️',
            description: '+10 Warmth capacity, 5 soak slots',
            category: 'production',
            tier: 2,
            cost: { clay: 50 },
            costMultiplier: 1.5,
            effects: {
                hotSpring: { type: 'expanded', capacity: 5, warmth: 10 }
            },
            requires: { naturalSpring: 1 },
            unlocked: false,
            max: 5
        },
        riversideGrove: {
            name: 'Riverside Grove',
            icon: '🌳',
            description: 'Unlocks Woodgnawer job, +30 Wood storage',
            category: 'production',
            tier: 2,
            cost: { reeds: 25, clay: 15 },
            costMultiplier: 1.3,
            effects: {
                unlock: ['wood', 'woodgnawer'],
                storage: { wood: 30 }
            },
            requires: { clayPit: 1 },
            unlocked: false,
            max: 5
        },
        fishingPond: {
            name: 'Fishing Pond',
            icon: '🎣',
            description: 'Unlocks Fisher job, +20 Fish storage',
            category: 'production',
            tier: 2,
            cost: { reeds: 30, clay: 20 },
            costMultiplier: 1.3,
            effects: {
                unlock: ['fish', 'fisher'],
                storage: { fish: 20 }
            },
            requires: { wovenLodge: 1 },
            unlocked: false,
            max: 3
        },
        dryingRack: {
            name: 'Drying Rack',
            icon: '🐟',
            description: '+50 Fish storage',
            category: 'storage',
            tier: 2,
            cost: { wood: 15 },
            costMultiplier: 1.2,
            effects: {
                storage: { fish: 50 }
            },
            requires: { riversideGrove: 1 },
            unlocked: false,
            max: 5
        },
        potteryKiln: {
            name: 'Pottery Kiln',
            icon: '🏺',
            description: 'Unlocks Potter job, +30 Pottery storage',
            category: 'production',
            tier: 2,
            cost: { clay: 40, wood: 10 },
            costMultiplier: 1.4,
            effects: {
                unlock: ['pottery', 'potter'],
                storage: { pottery: 30 }
            },
            requires: { workshop: 1 },
            unlocked: false,
            max: 3
        },
        storageHut: {
            name: 'Storage Hut',
            icon: '🏚️',
            description: '+50 Clay, +30 Pottery, +20 Mats storage',
            category: 'storage',
            tier: 2,
            cost: { wood: 25, mats: 10 },
            costMultiplier: 1.3,
            effects: {
                storage: { clay: 50, pottery: 30, mats: 20 }
            },
            requires: { workshop: 1 },
            unlocked: false,
            max: 5
        },

        // Tier 3 - Town
        woodenLonghouse: {
            name: 'Wooden Longhouse',
            icon: '🏡',
            description: '+10 Housing, very comfortable',
            category: 'housing',
            tier: 3,
            cost: { wood: 50, clay: 30, mats: 10 },
            costMultiplier: 1.2,
            effects: {
                housing: 10,
                happiness: 5
            },
            requires: { riversideGrove: 2, workshop: 1 },
            unlocked: false,
            max: 5
        },
        bathhouse: {
            name: 'Bathhouse',
            icon: '🏛️',
            description: 'Weather-protected hot spring, 8 slots',
            category: 'production',
            tier: 3,
            cost: { clay: 100, wood: 50, mats: 15 },
            costMultiplier: 1.5,
            effects: {
                hotSpring: { type: 'bathhouse', capacity: 8, warmth: 15, weatherProtected: true }
            },
            requires: { expandedPool: 1 },
            unlocked: false,
            max: 3
        },
        councilCircle: {
            name: 'Council Circle',
            icon: '🪨',
            description: 'Unlocks Elders and Research, +100 Science storage',
            category: 'production',
            tier: 3,
            cost: { stone: 75, wood: 50 },
            costMultiplier: 2,
            effects: {
                unlock: ['elder', 'science', 'research'],
                storage: { science: 100 }
            },
            requires: { quarry: 1 },
            unlocked: false,
            max: 1
        },
        library: {
            name: 'Library',
            icon: '📚',
            description: '+150 Science storage',
            category: 'storage',
            tier: 3,
            cost: { wood: 80, pottery: 20 },
            costMultiplier: 1.5,
            effects: {
                storage: { science: 150 }
            },
            requires: { councilCircle: 1 },
            unlocked: false,
            max: 3
        },
        quarry: {
            name: 'Quarry',
            icon: '⛏️',
            description: 'Unlocks Stone gathering, +100 Stone storage',
            category: 'production',
            tier: 3,
            cost: { wood: 40, clay: 30 },
            costMultiplier: 1.5,
            effects: {
                unlock: ['stone', 'quarrier'],
                storage: { stone: 100 }
            },
            requires: { riversideGrove: 2 },
            unlocked: false,
            max: 5
        },
        stoneYard: {
            name: 'Stone Yard',
            icon: '🪨',
            description: '+150 Stone storage',
            category: 'storage',
            tier: 3,
            cost: { wood: 60, clay: 40 },
            costMultiplier: 1.3,
            effects: {
                storage: { stone: 150 }
            },
            requires: { quarry: 1 },
            unlocked: false,
            max: 3
        },
        tradingPost: {
            name: 'Trading Post',
            icon: '🏪',
            description: 'Enables trade with visitors',
            category: 'production',
            tier: 3,
            cost: { wood: 100, pottery: 50 },
            costMultiplier: 2,
            effects: {
                unlock: ['trading']
            },
            requires: { potteryKiln: 1, woodenLonghouse: 1 },
            unlocked: false,
            max: 1
        },
        healersHut: {
            name: "Healer's Hut",
            icon: '🏥',
            description: 'Unlocks Healer job',
            category: 'production',
            tier: 3,
            cost: { wood: 60, herbs: 30 },
            costMultiplier: 1.5,
            effects: {
                unlock: ['healer']
            },
            requires: { herbGarden: 1 },
            unlocked: false,
            max: 2
        },
        herbGarden: {
            name: 'Herb Garden',
            icon: '🌱',
            description: 'Unlocks Herbs gathering',
            category: 'production',
            tier: 3,
            cost: { reeds: 50, clay: 30 },
            costMultiplier: 1.3,
            effects: {
                unlock: ['herbs', 'herbalist'],
                storage: { herbs: 20 }
            },
            requires: { wovenLodge: 2 },
            unlocked: false,
            max: 3
        },

        // Tier 4 - City
        stoneManor: {
            name: 'Stone Manor',
            icon: '🏰',
            description: '+20 Housing, luxury',
            category: 'housing',
            tier: 4,
            cost: { stone: 200, wood: 100 },
            costMultiplier: 1.3,
            effects: {
                housing: 20,
                happiness: 10
            },
            requires: { quarry: 2 },
            unlocked: false,
            max: 3
        },
        grandOnsen: {
            name: 'Grand Onsen',
            icon: '🏯',
            description: 'Ultimate hot spring, 15 slots, massive warmth',
            category: 'production',
            tier: 4,
            cost: { stone: 500, clay: 200 },
            costMultiplier: 2,
            effects: {
                hotSpring: { type: 'grand', capacity: 15, warmth: 30, weatherProtected: true }
            },
            requires: { bathhouse: 2 },
            unlocked: false,
            max: 1
        },
        greatHall: {
            name: 'Great Hall',
            icon: '🏛️',
            description: 'Enables The Great Migration',
            category: 'production',
            tier: 4,
            cost: { stone: 300, wood: 150 },
            costMultiplier: 2,
            effects: {
                unlock: ['migration']
            },
            requires: { councilCircle: 1, stoneManor: 1 },
            unlocked: false,
            max: 1
        },
        observatory: {
            name: 'Observatory',
            icon: '🔭',
            description: '+100% Science generation, +200 Science storage',
            category: 'production',
            tier: 4,
            cost: { stone: 400 },
            costMultiplier: 2,
            effects: {
                scienceMultiplier: 2,
                storage: { science: 200 }
            },
            requires: { councilCircle: 1 },
            unlocked: false,
            max: 1
        },

        // Special Buildings (discovered/event-based)
        naturalSpring: {
            name: 'Natural Hot Spring',
            icon: '♨️',
            description: 'A natural hot spring! 2 soak slots',
            category: 'special',
            tier: 0,
            cost: {},
            effects: {
                hotSpring: { type: 'natural', capacity: 2, warmth: 5 }
            },
            unlocked: false,
            discoverable: true,
            max: 1
        }
    },

    // Building counts
    counts: {},

    // Initialize buildings
    init() {
        for (const id of Object.keys(this.types)) {
            this.counts[id] = 0;
        }
    },

    // Get count of a building
    getCount(buildingId) {
        return this.counts[buildingId] || 0;
    },

    // Check if building is unlocked
    isUnlocked(buildingId) {
        const building = this.types[buildingId];
        if (!building) return false;
        
        // Check if already unlocked
        if (building.unlocked) return true;
        
        // Check requirements
        if (building.requires) {
            for (const [reqId, reqCount] of Object.entries(building.requires)) {
                if (this.getCount(reqId) < reqCount) {
                    return false;
                }
            }
            // Requirements met, unlock it
            building.unlocked = true;
            return true;
        }
        
        return false;
    },

    // Get current cost for a building (with price increase)
    getCost(buildingId) {
        const building = this.types[buildingId];
        if (!building) return {};
        
        const count = this.getCount(buildingId);
        const multiplier = Math.pow(building.costMultiplier || 1, count);
        
        const cost = {};
        for (const [resId, baseCost] of Object.entries(building.cost)) {
            cost[resId] = Math.ceil(baseCost * multiplier);
        }
        
        // Apply legacy discount
        const discount = Prestige.getDiscount();
        if (discount > 0) {
            for (const resId of Object.keys(cost)) {
                cost[resId] = Math.ceil(cost[resId] * (1 - discount));
            }
        }
        
        return cost;
    },

    // Check if we can build
    canBuild(buildingId) {
        const building = this.types[buildingId];
        if (!building) return false;
        
        // Check unlock status
        if (!this.isUnlocked(buildingId)) return false;
        
        // Check max
        if (building.max && this.getCount(buildingId) >= building.max) return false;
        
        // Check cost
        const cost = this.getCost(buildingId);
        return Resources.canAfford(cost);
    },

    // Build a building
    build(buildingId) {
        if (!this.canBuild(buildingId)) return false;
        
        const building = this.types[buildingId];
        const cost = this.getCost(buildingId);
        
        // Spend resources
        if (!Resources.spend(cost)) return false;
        
        // Increment count
        this.counts[buildingId]++;
        
        // Apply effects
        this.applyEffects(buildingId, building.effects);
        
        // Log message
        Game.log(`Built ${building.name}!`, 'success');
        
        // Check for new unlocks
        this.checkUnlocks();
        
        // Update rates
        Resources.recalculateRates();
        
        return true;
    },

    // Apply building effects
    applyEffects(buildingId, effects) {
        if (!effects) return;
        
        // Storage increases
        if (effects.storage) {
            for (const [resId, amount] of Object.entries(effects.storage)) {
                Resources.addMax(resId, amount);
            }
        }
        
        // Housing
        if (effects.housing) {
            Population.addHousing(effects.housing);
        }
        
        // Happiness
        if (effects.happiness) {
            Population.addHappinessBonus('building_' + buildingId, effects.happiness);
        }
        
        // Unlocks
        if (effects.unlock) {
            for (const unlockId of effects.unlock) {
                // Check if it's a resource
                if (Resources.types[unlockId]) {
                    Resources.unlock(unlockId);
                }
                // Check if it's a job
                if (Population.jobs[unlockId]) {
                    Population.unlockJob(unlockId);
                }
                // Special unlocks
                if (unlockId === 'research') {
                    Research.unlock();
                }
                if (unlockId === 'migration') {
                    Prestige.unlockMigration();
                }
            }
        }
        
        // Hot spring
        if (effects.hotSpring) {
            HotSprings.addSpring(effects.hotSpring);
        }
    },

    // Check for newly unlocked buildings
    checkUnlocks() {
        for (const [id, building] of Object.entries(this.types)) {
            if (!building.unlocked && building.requires) {
                this.isUnlocked(id);
            }
        }
    },

    // Discover natural spring (called by game events)
    discoverNaturalSpring() {
        if (this.counts.naturalSpring > 0) return false;
        
        this.types.naturalSpring.unlocked = true;
        this.counts.naturalSpring = 1;
        this.applyEffects('naturalSpring', this.types.naturalSpring.effects);
        
        Game.log('🎉 You discovered a Natural Hot Spring!', 'event');
        
        // Unlock expanded pool
        this.types.expandedPool.unlocked = true;
        
        return true;
    },

    // Get buildings list for UI
    getBuildings(category = 'all') {
        const buildings = [];
        
        for (const [id, building] of Object.entries(this.types)) {
            // Skip discoverable buildings that aren't discovered
            if (building.discoverable && !building.unlocked) continue;
            
            // Filter by category
            if (category !== 'all' && building.category !== category) continue;
            
            // Check if unlocked or requirements visible
            const isUnlocked = this.isUnlocked(id);
            const count = this.getCount(id);
            const isMaxed = building.max && count >= building.max;
            
            // Only show if unlocked, or if tier 1-2 and could be unlocked soon
            if (!isUnlocked && building.tier > 2) continue;
            
            buildings.push({
                id,
                ...building,
                count,
                cost: this.getCost(id),
                affordable: Resources.canAfford(this.getCost(id)),
                unlocked: isUnlocked,
                maxed: isMaxed
            });
        }
        
        // Sort by tier, then by unlock status
        buildings.sort((a, b) => {
            if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
            return a.tier - b.tier;
        });
        
        return buildings;
    },

    // Get total housing from buildings
    getTotalHousing() {
        let housing = 4; // Base housing (riverbank)
        
        for (const [id, building] of Object.entries(this.types)) {
            if (building.effects?.housing) {
                housing += building.effects.housing * this.getCount(id);
            }
        }
        
        return housing;
    },

    // Get total happiness bonus from buildings
    getHappinessBonus() {
        let bonus = 0;
        
        for (const [id, building] of Object.entries(this.types)) {
            if (building.effects?.happiness) {
                bonus += building.effects.happiness * this.getCount(id);
            }
        }
        
        return bonus;
    },

    // Export state for saving
    getSaveData() {
        return {
            counts: { ...this.counts },
            unlocked: Object.fromEntries(
                Object.entries(this.types)
                    .filter(([_, b]) => b.unlocked)
                    .map(([id, _]) => [id, true])
            )
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.counts) {
            for (const [id, count] of Object.entries(data.counts)) {
                if (this.counts.hasOwnProperty(id)) {
                    this.counts[id] = count;
                }
            }
        }
        if (data.unlocked) {
            for (const id of Object.keys(data.unlocked)) {
                if (this.types[id]) {
                    this.types[id].unlocked = true;
                }
            }
        }
    }
};


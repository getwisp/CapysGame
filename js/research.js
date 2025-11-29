// Capys Game - Research System

const Research = {
    // Is research unlocked?
    unlocked: false,
    
    // Research definitions
    technologies: {
        // Survival Branch
        grassCultivation: {
            name: 'Grass Cultivation',
            branch: 'survival',
            description: '+25% grass production',
            cost: { science: 50 },
            effects: {
                productionBonus: { grass: 0.25 }
            },
            requires: [],
            researched: false
        },
        irrigation: {
            name: 'Irrigation',
            branch: 'survival',
            description: '+50% grass production, unlocks better farming',
            cost: { science: 150 },
            effects: {
                productionBonus: { grass: 0.5 }
            },
            requires: ['grassCultivation'],
            researched: false
        },
        foodStorage: {
            name: 'Food Storage',
            branch: 'survival',
            description: '+100 grass storage',
            cost: { science: 75 },
            effects: {
                storage: { grass: 100 }
            },
            requires: ['grassCultivation'],
            researched: false
        },
        preservation: {
            name: 'Preservation',
            branch: 'survival',
            description: '+50 fish storage, fish last longer',
            cost: { science: 200 },
            effects: {
                storage: { fish: 50 }
            },
            requires: ['foodStorage'],
            researched: false
        },

        // Construction Branch
        reedWeaving: {
            name: 'Reed Weaving',
            branch: 'construction',
            description: '+25% reed gathering',
            cost: { science: 50 },
            effects: {
                productionBonus: { reeds: 0.25 }
            },
            requires: [],
            researched: false
        },
        woodworking: {
            name: 'Woodworking',
            branch: 'construction',
            description: '+25% wood production',
            cost: { science: 75 },
            effects: {
                productionBonus: { wood: 0.25 }
            },
            requires: ['reedWeaving'],
            researched: false
        },
        clayWorking: {
            name: 'Clay Working',
            branch: 'construction',
            description: '+25% clay production',
            cost: { science: 100 },
            effects: {
                productionBonus: { clay: 0.25 }
            },
            requires: ['reedWeaving'],
            researched: false
        },
        advancedWoodworking: {
            name: 'Advanced Woodworking',
            branch: 'construction',
            description: '+50% wood production',
            cost: { science: 175 },
            effects: {
                productionBonus: { wood: 0.5 }
            },
            requires: ['woodworking'],
            researched: false
        },
        stonecraft: {
            name: 'Stonecraft',
            branch: 'construction',
            description: '+25% stone production',
            cost: { science: 250 },
            effects: {
                productionBonus: { stone: 0.25 }
            },
            requires: ['clayWorking'],
            researched: false
        },
        advancedPottery: {
            name: 'Advanced Pottery',
            branch: 'construction',
            description: '+50% pottery crafting speed',
            cost: { science: 175 },
            effects: {
                productionBonus: { pottery: 0.5 }
            },
            requires: ['clayWorking'],
            researched: false
        },
        matsWeaving: {
            name: 'Mats Weaving',
            branch: 'construction',
            description: '+50% mats crafting speed',
            cost: { science: 125 },
            effects: {
                productionBonus: { mats: 0.5 }
            },
            requires: ['reedWeaving'],
            researched: false
        },

        // Hot Springs Branch
        springDiscovery: {
            name: 'Spring Discovery',
            branch: 'springs',
            description: 'Increases chance of finding hot springs',
            cost: { science: 75 },
            effects: {
                springDiscovery: 2
            },
            requires: [],
            researched: false
        },
        poolExpansion: {
            name: 'Pool Expansion',
            branch: 'springs',
            description: '+2 capacity to all hot springs',
            cost: { science: 150 },
            effects: {
                springCapacity: 2
            },
            requires: ['springDiscovery'],
            researched: false
        },
        steamEngineering: {
            name: 'Steam Engineering',
            branch: 'springs',
            description: '+50% warmth generation',
            cost: { science: 300 },
            effects: {
                warmthBonus: 0.5
            },
            requires: ['poolExpansion'],
            researched: false
        },
        herbalSoaking: {
            name: 'Herbal Soaking',
            branch: 'springs',
            description: 'Hot springs provide +5 happiness',
            cost: { science: 100 },
            effects: {
                springHappiness: 5
            },
            requires: ['springDiscovery'],
            researched: false
        },
        medicinalBaths: {
            name: 'Medicinal Baths',
            branch: 'springs',
            description: 'Soaking provides healing, extends relaxation buff',
            cost: { science: 250 },
            effects: {
                relaxationDuration: 2
            },
            requires: ['herbalSoaking'],
            researched: false
        },

        // Social Branch
        communityBonds: {
            name: 'Community Bonds',
            branch: 'social',
            description: '+10 base happiness',
            cost: { science: 50 },
            effects: {
                baseHappiness: 10
            },
            requires: [],
            researched: false
        },
        visitorWelcome: {
            name: 'Visitor Welcome',
            branch: 'social',
            description: 'Visitors stay 50% longer',
            cost: { science: 125 },
            effects: {
                visitorDuration: 1.5
            },
            requires: ['communityBonds'],
            researched: false
        },
        interspeciesDiplomacy: {
            name: 'Interspecies Diplomacy',
            branch: 'social',
            description: 'Visitor bonuses doubled',
            cost: { science: 300 },
            effects: {
                visitorBonus: 2
            },
            requires: ['visitorWelcome'],
            researched: false
        },
        oralTradition: {
            name: 'Oral Tradition',
            branch: 'social',
            description: '+25% science generation',
            cost: { science: 100 },
            effects: {
                scienceBonus: 0.25
            },
            requires: ['communityBonds'],
            researched: false
        },
        writing: {
            name: 'Writing',
            branch: 'social',
            description: '+50% science generation',
            cost: { science: 200 },
            effects: {
                scienceBonus: 0.5
            },
            requires: ['oralTradition'],
            researched: false
        },
        philosophy: {
            name: 'Philosophy',
            branch: 'social',
            description: '+25 base happiness, capybaras ponder existence',
            cost: { science: 400 },
            effects: {
                baseHappiness: 25
            },
            requires: ['writing'],
            researched: false
        },
        
        // Storage Research
        resourceStorage: {
            name: 'Resource Storage',
            branch: 'construction',
            description: '+25% storage capacity for all resources',
            cost: { science: 300 },
            effects: {
                storageMultiplier: 0.25
            },
            requires: ['foodStorage', 'clayWorking'],
            researched: false
        },
        grandStorage: {
            name: 'Grand Storage',
            branch: 'construction',
            description: '+50% storage capacity for all resources',
            cost: { science: 800 },
            effects: {
                storageMultiplier: 0.5
            },
            requires: ['resourceStorage', 'stonecraft'],
            researched: false
        }
    },

    // Active bonuses from research
    bonuses: {
        productionBonus: {},
        storage: {},
        storageMultiplier: 0,
        springCapacity: 0,
        warmthBonus: 0,
        springHappiness: 0,
        relaxationDuration: 1,
        baseHappiness: 0,
        visitorDuration: 1,
        visitorBonus: 1,
        scienceBonus: 0,
        springDiscovery: 1
    },

    // Initialize
    init() {
        this.unlocked = false;
        for (const tech of Object.values(this.technologies)) {
            tech.researched = false;
        }
        this.resetBonuses();
    },

    // Reset bonuses
    resetBonuses() {
        this.bonuses = {
            productionBonus: {},
            storage: {},
            storageMultiplier: 0,
            springCapacity: 0,
            warmthBonus: 0,
            springHappiness: 0,
            relaxationDuration: 1,
            baseHappiness: 0,
            visitorDuration: 1,
            visitorBonus: 1,
            scienceBonus: 0,
            springDiscovery: 1
        };
    },

    // Unlock research
    unlock() {
        this.unlocked = true;
        Game.log('📚 Research unlocked! Elders can now study.', 'success');
    },

    // Check if research is available
    isUnlocked() {
        return this.unlocked;
    },

    // Check if a technology can be researched
    canResearch(techId) {
        const tech = this.technologies[techId];
        if (!tech) return false;
        if (tech.researched) return false;
        
        // Check requirements
        for (const reqId of tech.requires) {
            if (!this.technologies[reqId]?.researched) {
                return false;
            }
        }
        
        // Check cost
        return Resources.canAfford(tech.cost);
    },

    // Research a technology
    research(techId) {
        if (!this.canResearch(techId)) return false;
        
        const tech = this.technologies[techId];
        
        // Spend resources
        if (!Resources.spend(tech.cost)) return false;
        
        // Mark as researched
        tech.researched = true;
        
        // Apply effects
        this.applyEffects(tech.effects);
        
        Game.log(`📖 Researched ${tech.name}!`, 'success');
        
        return true;
    },

    // Apply research effects
    applyEffects(effects) {
        if (!effects) return;
        
        if (effects.productionBonus) {
            for (const [resId, bonus] of Object.entries(effects.productionBonus)) {
                this.bonuses.productionBonus[resId] = (this.bonuses.productionBonus[resId] || 0) + bonus;
            }
        }
        
        if (effects.storage) {
            for (const [resId, amount] of Object.entries(effects.storage)) {
                Resources.addMax(resId, amount);
            }
        }
        
        if (effects.springCapacity) {
            this.bonuses.springCapacity += effects.springCapacity;
        }
        
        if (effects.warmthBonus) {
            this.bonuses.warmthBonus += effects.warmthBonus;
        }
        
        if (effects.springHappiness) {
            this.bonuses.springHappiness += effects.springHappiness;
            Population.addHappinessBonus('hotSprings', this.bonuses.springHappiness);
        }
        
        if (effects.relaxationDuration) {
            this.bonuses.relaxationDuration *= effects.relaxationDuration;
        }
        
        if (effects.baseHappiness) {
            this.bonuses.baseHappiness += effects.baseHappiness;
            Population.baseHappiness += effects.baseHappiness;
        }
        
        if (effects.visitorDuration) {
            this.bonuses.visitorDuration *= effects.visitorDuration;
        }
        
        if (effects.visitorBonus) {
            this.bonuses.visitorBonus *= effects.visitorBonus;
        }
        
        if (effects.scienceBonus) {
            this.bonuses.scienceBonus += effects.scienceBonus;
        }
        
        if (effects.springDiscovery) {
            this.bonuses.springDiscovery *= effects.springDiscovery;
        }
        
        if (effects.storageMultiplier) {
            this.bonuses.storageMultiplier += effects.storageMultiplier;
        }
        
        // Recalculate rates
        Resources.recalculateRates();
    },

    // Get production bonus for a resource
    getProductionBonus(resourceId) {
        return this.bonuses.productionBonus[resourceId] || 0;
    },

    // Get science generation bonus
    getScienceBonus() {
        return 1 + this.bonuses.scienceBonus;
    },

    // Get technologies for a branch
    getTechnologiesByBranch(branch) {
        const techs = [];
        
        for (const [id, tech] of Object.entries(this.technologies)) {
            if (tech.branch === branch) {
                const isAvailable = tech.requires.every(r => this.technologies[r]?.researched);
                const canAfford = Resources.canAfford(tech.cost);
                
                techs.push({
                    id,
                    ...tech,
                    available: isAvailable && !tech.researched,
                    affordable: canAfford,
                    locked: !isAvailable && !tech.researched
                });
            }
        }
        
        return techs;
    },

    // Get count of researched technologies
    getResearchedCount() {
        return Object.values(this.technologies).filter(t => t.researched).length;
    },

    // Export state for saving
    getSaveData() {
        return {
            unlocked: this.unlocked,
            researched: Object.fromEntries(
                Object.entries(this.technologies)
                    .filter(([_, t]) => t.researched)
                    .map(([id, _]) => [id, true])
            ),
            bonuses: { ...this.bonuses }
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.unlocked !== undefined) this.unlocked = data.unlocked;
        
        if (data.researched) {
            for (const [id, researched] of Object.entries(data.researched)) {
                if (this.technologies[id] && researched) {
                    this.technologies[id].researched = true;
                }
            }
        }
        
        if (data.bonuses) {
            this.bonuses = { ...this.bonuses, ...data.bonuses };
        }
    }
};


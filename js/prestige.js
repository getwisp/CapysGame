// Capys Game - Prestige/Migration System

const Prestige = {
    // Is migration unlocked?
    migrationUnlocked: false,
    
    // Legacy points (persistent currency)
    legacyPoints: 0,
    
    // Legacy upgrades
    upgrades: {
        ancestralKnowledge: {
            name: 'Ancestral Knowledge',
            description: 'Start with Grass Cultivation researched',
            cost: 10,
            purchased: false,
            effect: { startResearch: 'grassCultivation' }
        },
        inheritedTools: {
            name: 'Inherited Tools',
            description: '+25% base gathering speed',
            cost: 15,
            purchased: false,
            effect: { gatheringBonus: 0.25 }
        },
        hotSpringSense: {
            name: 'Hot Spring Sense',
            description: 'Find hot springs 50% faster',
            cost: 20,
            purchased: false,
            effect: { springDiscovery: 1.5 }
        },
        friendlyReputation: {
            name: 'Friendly Reputation',
            description: 'Visitors arrive 50% sooner',
            cost: 25,
            purchased: false,
            effect: { visitorRate: 1.5 }
        },
        elderWisdom: {
            name: 'Elder Wisdom',
            description: '+50% Science generation',
            cost: 50,
            purchased: false,
            effect: { scienceBonus: 0.5 }
        },
        masterBuilders: {
            name: 'Master Builders',
            description: '-20% building costs',
            cost: 75,
            purchased: false,
            effect: { buildingDiscount: 0.2 }
        },
        warmthMemory: {
            name: 'Warmth Memory',
            description: 'Start with 75% warmth instead of 50%',
            cost: 30,
            purchased: false,
            effect: { startWarmth: 0.75 }
        },
        largerFamily: {
            name: 'Larger Family',
            description: 'Start with 4 capybaras instead of 2',
            cost: 40,
            purchased: false,
            effect: { startPop: 4 }
        },
        bountifulStart: {
            name: 'Bountiful Start',
            description: 'Start with 50 of each basic resource',
            cost: 35,
            purchased: false,
            effect: { startResources: 50 }
        }
    },

    // Active bonuses from purchased upgrades
    bonuses: {
        gatheringBonus: 0,
        springDiscovery: 1,
        visitorRate: 1,
        scienceBonus: 0,
        buildingDiscount: 0,
        startWarmth: 0.5,
        startPop: 2,
        startResources: 0,
        startResearch: []
    },

    // Migration count
    migrationCount: 0,

    // Initialize
    init() {
        // Don't reset legacy points or purchased upgrades
        this.migrationUnlocked = false;
        this.recalculateBonuses();
    },

    // Unlock migration
    unlockMigration() {
        this.migrationUnlocked = true;
        document.getElementById('btn-migrate')?.classList.remove('hidden');
        Game.log('🌍 The Great Migration is now available!', 'success');
    },

    // Check if migration is unlocked
    isMigrationUnlocked() {
        return this.migrationUnlocked;
    },

    // Calculate legacy points that would be earned
    calculateLegacyPoints() {
        const breakdown = [];
        let total = 0;
        
        // Population bonus
        const pop = Population.getTotal();
        const popPoints = Math.floor(pop / 10);
        if (popPoints > 0) {
            breakdown.push({ name: 'Population', value: popPoints, detail: `${pop} capybaras` });
            total += popPoints;
        }
        
        // Buildings bonus
        let buildingCount = 0;
        for (const count of Object.values(Buildings.counts)) {
            buildingCount += count;
        }
        const buildingPoints = Math.floor(buildingCount / 5);
        if (buildingPoints > 0) {
            breakdown.push({ name: 'Buildings', value: buildingPoints, detail: `${buildingCount} buildings` });
            total += buildingPoints;
        }
        
        // Research bonus
        const researchCount = Research.getResearchedCount();
        const researchPoints = researchCount * 2;
        if (researchPoints > 0) {
            breakdown.push({ name: 'Research', value: researchPoints, detail: `${researchCount} technologies` });
            total += researchPoints;
        }
        
        // Visitors bonus
        const visitorCount = Visitors.getEncounteredCount();
        const visitorPoints = visitorCount * 3;
        if (visitorPoints > 0) {
            breakdown.push({ name: 'Visitors', value: visitorPoints, detail: `${visitorCount} species` });
            total += visitorPoints;
        }
        
        // Grand Onsen bonus
        if (Buildings.getCount('grandOnsen') > 0) {
            breakdown.push({ name: 'Grand Onsen', value: 10, detail: 'Built the ultimate hot spring' });
            total += 10;
        }
        
        // Great Hall bonus
        if (Buildings.getCount('greatHall') > 0) {
            breakdown.push({ name: 'Great Hall', value: 5, detail: 'Built the Great Hall' });
            total += 5;
        }
        
        // Migration count bonus
        if (this.migrationCount > 0) {
            const migrationBonus = this.migrationCount * 2;
            breakdown.push({ name: 'Veteran Migrators', value: migrationBonus, detail: `${this.migrationCount} previous migrations` });
            total += migrationBonus;
        }
        
        return { breakdown, total };
    },

    // Purchase a legacy upgrade
    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade) return false;
        if (upgrade.purchased) return false;
        if (this.legacyPoints < upgrade.cost) return false;
        
        this.legacyPoints -= upgrade.cost;
        upgrade.purchased = true;
        
        this.recalculateBonuses();
        
        return true;
    },

    // Recalculate bonuses from purchased upgrades
    recalculateBonuses() {
        // Reset bonuses
        this.bonuses = {
            gatheringBonus: 0,
            springDiscovery: 1,
            visitorRate: 1,
            scienceBonus: 0,
            buildingDiscount: 0,
            startWarmth: 0.5,
            startPop: 2,
            startResources: 0,
            startResearch: []
        };
        
        // Apply purchased upgrades
        for (const [id, upgrade] of Object.entries(this.upgrades)) {
            if (upgrade.purchased && upgrade.effect) {
                if (upgrade.effect.gatheringBonus) {
                    this.bonuses.gatheringBonus += upgrade.effect.gatheringBonus;
                }
                if (upgrade.effect.springDiscovery) {
                    this.bonuses.springDiscovery *= upgrade.effect.springDiscovery;
                }
                if (upgrade.effect.visitorRate) {
                    this.bonuses.visitorRate *= upgrade.effect.visitorRate;
                }
                if (upgrade.effect.scienceBonus) {
                    this.bonuses.scienceBonus += upgrade.effect.scienceBonus;
                }
                if (upgrade.effect.buildingDiscount) {
                    this.bonuses.buildingDiscount += upgrade.effect.buildingDiscount;
                }
                if (upgrade.effect.startWarmth) {
                    this.bonuses.startWarmth = upgrade.effect.startWarmth;
                }
                if (upgrade.effect.startPop) {
                    this.bonuses.startPop = upgrade.effect.startPop;
                }
                if (upgrade.effect.startResources) {
                    this.bonuses.startResources = upgrade.effect.startResources;
                }
                if (upgrade.effect.startResearch) {
                    this.bonuses.startResearch.push(upgrade.effect.startResearch);
                }
            }
        }
    },

    // Get gathering bonus
    getGatheringBonus() {
        return 1 + this.bonuses.gatheringBonus;
    },

    // Get building discount
    getDiscount() {
        return this.bonuses.buildingDiscount;
    },

    // Perform the great migration
    migrate() {
        // Calculate and award legacy points
        const { total } = this.calculateLegacyPoints();
        this.legacyPoints += total;
        this.migrationCount++;
        
        // Reset game state (but keep prestige data)
        this.resetGameState();
        
        Game.log(`🌍 The Great Migration complete! Earned ${total} Legacy Points.`, 'success');
        
        return total;
    },

    // Reset game state for new run
    resetGameState() {
        // Reset resources
        Resources.init();
        if (this.bonuses.startResources > 0) {
            Resources.amounts.grass = this.bonuses.startResources;
            Resources.amounts.reeds = this.bonuses.startResources;
        }
        
        // Reset buildings
        Buildings.init();
        
        // Reset population with legacy bonus
        Population.init();
        Population.adults = this.bonuses.startPop;
        
        // Reset hot springs with legacy bonus
        HotSprings.init();
        HotSprings.warmth = this.bonuses.startWarmth * 100;
        
        // Reset seasons
        Seasons.init();
        
        // Reset research
        Research.init();
        for (const techId of this.bonuses.startResearch) {
            if (Research.technologies[techId]) {
                Research.technologies[techId].researched = true;
                Research.applyEffects(Research.technologies[techId].effects);
            }
        }
        
        // Reset visitors
        Visitors.init();
        
        // Migration is no longer unlocked (need to build Great Hall again)
        this.migrationUnlocked = false;
        
        // Clear message log
        document.getElementById('message-log').innerHTML = 
            '<div class="message welcome">A new journey begins... Your capybaras arrive at fresh wetlands.</div>';
    },

    // Get upgrades for UI
    getUpgrades() {
        const upgrades = [];
        
        for (const [id, upgrade] of Object.entries(this.upgrades)) {
            upgrades.push({
                id,
                ...upgrade,
                affordable: this.legacyPoints >= upgrade.cost
            });
        }
        
        return upgrades;
    },

    // Export state for saving
    getSaveData() {
        return {
            legacyPoints: this.legacyPoints,
            migrationCount: this.migrationCount,
            migrationUnlocked: this.migrationUnlocked,
            purchased: Object.fromEntries(
                Object.entries(this.upgrades)
                    .filter(([_, u]) => u.purchased)
                    .map(([id, _]) => [id, true])
            )
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.legacyPoints !== undefined) this.legacyPoints = data.legacyPoints;
        if (data.migrationCount !== undefined) this.migrationCount = data.migrationCount;
        if (data.migrationUnlocked !== undefined) this.migrationUnlocked = data.migrationUnlocked;
        
        if (data.purchased) {
            for (const [id, purchased] of Object.entries(data.purchased)) {
                if (this.upgrades[id] && purchased) {
                    this.upgrades[id].purchased = true;
                }
            }
        }
        
        this.recalculateBonuses();
    }
};


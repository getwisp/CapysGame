// Capys Game - Seasons and Weather System

const Seasons = {
    // Time tracking
    tickCount: 0,
    dayLength: 600, // Ticks per day (60 seconds)
    seasonLength: 6000, // Ticks per season (10 minutes)
    
    // Current state
    currentDay: 1,
    currentSeason: 'spring',
    currentWeather: 'sunny',
    isNightTime: false,
    
    // Season order
    seasonOrder: ['spring', 'summer', 'autumn', 'winter'],
    currentSeasonIndex: 0,
    
    // Weather types and probabilities per season
    weatherTypes: {
        spring: {
            sunny: 0.4,
            cloudy: 0.3,
            rain: 0.3
        },
        summer: {
            sunny: 0.6,
            cloudy: 0.2,
            heatWave: 0.2
        },
        autumn: {
            sunny: 0.3,
            cloudy: 0.4,
            rain: 0.3
        },
        winter: {
            sunny: 0.2,
            cloudy: 0.3,
            coldSnap: 0.3,
            snow: 0.2
        }
    },

    // Weather effects
    weatherEffects: {
        sunny: {
            name: 'Sunny',
            icon: '☀️',
            happiness: 5,
            grassGrowth: 1.2
        },
        cloudy: {
            name: 'Cloudy',
            icon: '☁️',
            happiness: 0,
            grassGrowth: 1.0
        },
        rain: {
            name: 'Rainy',
            icon: '🌧️',
            happiness: -5,
            reedGrowth: 1.5,
            outdoorWork: 0.7
        },
        heatWave: {
            name: 'Heat Wave',
            icon: '🌡️',
            happiness: -3,
            warmthEfficiency: 0.7,
            fishGrowth: 1.3
        },
        coldSnap: {
            name: 'Cold Snap',
            icon: '❄️',
            happiness: -10,
            warmthConsumption: 2,
            outdoorWork: 0.5
        },
        snow: {
            name: 'Snowy',
            icon: '🌨️',
            happiness: 3,
            outdoorWork: 0.6
        }
    },

    // Season effects
    seasonEffects: {
        spring: {
            name: 'Spring',
            icon: '🌸',
            grassGrowth: 1.25,
            visitorChance: 1.5
        },
        summer: {
            name: 'Summer',
            icon: '☀️',
            happiness: 10,
            grassGrowth: 1.0,
            fishGrowth: 1.2
        },
        autumn: {
            name: 'Autumn',
            icon: '🍂',
            harvestBonus: 1.3,
            grassGrowth: 0.8
        },
        winter: {
            name: 'Winter',
            icon: '❄️',
            happiness: -5,
            grassGrowth: 0.3,
            outdoorWork: 0.5,
            warmthConsumption: 2
        }
    },

    // Weather change timer
    weatherTimer: 0,
    weatherDuration: 1200, // 2 minutes per weather

    // Initialize
    init() {
        this.tickCount = 0;
        this.currentDay = 1;
        this.currentSeasonIndex = 0;
        this.currentSeason = 'spring';
        this.currentWeather = 'sunny';
        this.isNightTime = false;
        this.weatherTimer = 0;
    },

    // Get current season
    getCurrentSeason() {
        return this.currentSeason;
    },

    // Get current weather
    getCurrentWeather() {
        return this.currentWeather;
    },

    // Check if it's night
    isNight() {
        return this.isNightTime;
    },
    
    // Get time of day phase for smooth transitions (dawn, day, dusk, night)
    getTimePhase() {
        const dayProgress = this.tickCount % this.dayLength;
        const quarterDay = this.dayLength / 4;
        
        // Dawn: 0-12.5% of day
        if (dayProgress < quarterDay / 2) {
            return 'dawn';
        }
        // Day: 12.5%-50% of day
        if (dayProgress < this.dayLength / 2) {
            return 'day';
        }
        // Dusk: 50%-62.5% of day
        if (dayProgress < this.dayLength / 2 + quarterDay / 2) {
            return 'dusk';
        }
        // Night: 62.5%-100% of day
        return 'night';
    },

    // Get current day
    getDay() {
        return this.currentDay;
    },

    // Get season info for display
    getSeasonInfo() {
        const effects = this.seasonEffects[this.currentSeason];
        return {
            name: effects.name,
            icon: effects.icon,
            season: this.currentSeason
        };
    },

    // Get weather info for display
    getWeatherInfo() {
        const effects = this.weatherEffects[this.currentWeather];
        return {
            name: effects.name,
            icon: effects.icon,
            weather: this.currentWeather
        };
    },

    // Get time of day info
    getTimeInfo() {
        return {
            isNight: this.isNightTime,
            icon: this.isNightTime ? '🌙' : '🌤️'
        };
    },

    // Get production multiplier from season
    getSeasonProductionMultiplier(resourceType) {
        const effects = this.seasonEffects[this.currentSeason];
        
        if (resourceType === 'grass' && effects.grassGrowth) {
            return effects.grassGrowth;
        }
        if (resourceType === 'fish' && effects.fishGrowth) {
            return effects.fishGrowth;
        }
        
        return 1;
    },

    // Get production multiplier from weather
    getWeatherProductionMultiplier(resourceType) {
        const effects = this.weatherEffects[this.currentWeather];
        
        if (resourceType === 'grass' && effects.grassGrowth) {
            return effects.grassGrowth;
        }
        if (resourceType === 'reeds' && effects.reedGrowth) {
            return effects.reedGrowth;
        }
        if (resourceType === 'fish' && effects.fishGrowth) {
            return effects.fishGrowth;
        }
        
        return 1;
    },

    // Get outdoor work multiplier
    getOutdoorWorkMultiplier() {
        let multiplier = 1;
        
        const seasonEffects = this.seasonEffects[this.currentSeason];
        if (seasonEffects.outdoorWork) {
            multiplier *= seasonEffects.outdoorWork;
        }
        
        const weatherEffects = this.weatherEffects[this.currentWeather];
        if (weatherEffects.outdoorWork) {
            multiplier *= weatherEffects.outdoorWork;
        }
        
        // Night penalty
        if (this.isNightTime) {
            multiplier *= 0.7;
        }
        
        return multiplier;
    },

    // Get warmth consumption multiplier
    getWarmthConsumptionMultiplier() {
        let multiplier = 1;
        
        const seasonEffects = this.seasonEffects[this.currentSeason];
        if (seasonEffects.warmthConsumption) {
            multiplier *= seasonEffects.warmthConsumption;
        }
        
        const weatherEffects = this.weatherEffects[this.currentWeather];
        if (weatherEffects.warmthConsumption) {
            multiplier *= weatherEffects.warmthConsumption;
        }
        
        return multiplier;
    },

    // Get happiness modifier
    getHappinessModifier() {
        let modifier = 0;
        
        const seasonEffects = this.seasonEffects[this.currentSeason];
        if (seasonEffects.happiness) {
            modifier += seasonEffects.happiness;
        }
        
        const weatherEffects = this.weatherEffects[this.currentWeather];
        if (weatherEffects.happiness) {
            modifier += weatherEffects.happiness;
        }
        
        return modifier;
    },

    // Get visitor chance multiplier
    getVisitorChanceMultiplier() {
        const seasonEffects = this.seasonEffects[this.currentSeason];
        return seasonEffects.visitorChance || 1;
    },

    // Change weather randomly based on season
    changeWeather() {
        const seasonWeather = this.weatherTypes[this.currentSeason];
        const roll = Math.random();
        
        let cumulative = 0;
        for (const [weather, probability] of Object.entries(seasonWeather)) {
            cumulative += probability;
            if (roll <= cumulative) {
                if (weather !== this.currentWeather) {
                    this.currentWeather = weather;
                    const info = this.getWeatherInfo();
                    Game.log(`Weather changed to ${info.name} ${info.icon}`, 'event');
                }
                return;
            }
        }
    },
    
    // Forecast next weather (used by Birds visitor)
    forecastNextWeather() {
        const seasonWeather = this.weatherTypes[this.currentSeason];
        // Find most likely weather for current season
        let mostLikely = 'sunny';
        let highestProb = 0;
        
        for (const [weather, probability] of Object.entries(seasonWeather)) {
            if (probability > highestProb) {
                highestProb = probability;
                mostLikely = weather;
            }
        }
        
        // Return weather info for forecast
        const weatherInfo = {
            sunny: { name: 'Sunny', icon: '☀️' },
            rain: { name: 'Rainy', icon: '🌧️' },
            heatWave: { name: 'Heat Wave', icon: '🔥' },
            coldSnap: { name: 'Cold Snap', icon: '❄️' }
        };
        
        return weatherInfo[mostLikely] || weatherInfo.sunny;
    },
    
    // Get time until next weather change (in ticks)
    getTimeUntilWeatherChange() {
        return this.weatherDuration - this.weatherTimer;
    },

    // Advance to next season
    nextSeason() {
        this.currentSeasonIndex = (this.currentSeasonIndex + 1) % 4;
        this.currentSeason = this.seasonOrder[this.currentSeasonIndex];
        
        const info = this.getSeasonInfo();
        Game.log(`🌿 ${info.name} has arrived! ${info.icon}`, 'event');
        
        // Change weather for new season
        this.changeWeather();
        
        // Apply season happiness
        const happinessMod = this.getHappinessModifier();
        if (happinessMod !== 0) {
            if (happinessMod > 0) {
                Population.addHappinessBonus('season', happinessMod);
            } else {
                Population.addHappinessPenalty('season', Math.abs(happinessMod));
            }
        } else {
            Population.removeHappinessModifier('season');
        }
    },

    // Process tick
    tick() {
        this.tickCount++;
        
        // Update day/night (cycle every half day)
        const dayProgress = this.tickCount % this.dayLength;
        const wasNight = this.isNightTime;
        this.isNightTime = dayProgress >= this.dayLength / 2;
        
        // Log day/night change
        if (wasNight !== this.isNightTime) {
            if (this.isNightTime) {
                Game.log('🌙 Night falls...', 'event');
            } else {
                Game.log('🌅 A new day dawns!', 'event');
            }
        }
        
        // Update day count
        if (dayProgress === 0 && this.tickCount > 0) {
            this.currentDay++;
        }
        
        // Update weather
        this.weatherTimer++;
        if (this.weatherTimer >= this.weatherDuration) {
            this.weatherTimer = 0;
            this.changeWeather();
        }
        
        // Check for season change
        if (this.tickCount % this.seasonLength === 0 && this.tickCount > 0) {
            this.nextSeason();
        }
        
        // Random events
        this.checkRandomEvents();
    },

    // Check for random events
    checkRandomEvents() {
        // Natural hot spring discovery (with research + prestige bonus)
        if (!Buildings.types.naturalSpring.unlocked && 
            this.tickCount > 1000) {
            let discoveryChance = 0.0005;
            // Apply Spring Discovery research bonus
            if (Research.bonuses.springDiscovery) {
                discoveryChance *= Research.bonuses.springDiscovery;
            }
            // Apply Hot Spring Sense prestige bonus
            if (Prestige.bonuses.springDiscovery) {
                discoveryChance *= Prestige.bonuses.springDiscovery;
            }
            if (Math.random() < discoveryChance) {
                Buildings.discoverNaturalSpring();
            }
        }
        
        // Visitor arrival check (with prestige bonus for rate)
        let visitorChance = 0.0003 * this.getVisitorChanceMultiplier();
        if (Prestige.bonuses.visitorRate) {
            visitorChance *= Prestige.bonuses.visitorRate;
        }
        if (Math.random() < visitorChance) {
            Visitors.trySpawnVisitor();
        }
    },

    // Export state for saving
    getSaveData() {
        return {
            tickCount: this.tickCount,
            currentDay: this.currentDay,
            currentSeasonIndex: this.currentSeasonIndex,
            currentSeason: this.currentSeason,
            currentWeather: this.currentWeather,
            isNightTime: this.isNightTime,
            weatherTimer: this.weatherTimer
        };
    },

    // Load state from save
    loadSaveData(data) {
        if (data.tickCount !== undefined) this.tickCount = data.tickCount;
        if (data.currentDay !== undefined) this.currentDay = data.currentDay;
        if (data.currentSeasonIndex !== undefined) this.currentSeasonIndex = data.currentSeasonIndex;
        if (data.currentSeason !== undefined) this.currentSeason = data.currentSeason;
        if (data.currentWeather !== undefined) this.currentWeather = data.currentWeather;
        if (data.isNightTime !== undefined) this.isNightTime = data.isNightTime;
        if (data.weatherTimer !== undefined) this.weatherTimer = data.weatherTimer;
    }
};


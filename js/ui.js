// Capys Game - UI System

const UI = {
    // Currently active tab
    activeTab: 'population',
    
    // Currently selected building category
    buildingCategory: 'all',
    
    // Currently selected research branch
    researchBranch: 'survival',
    
    // Floating text counter for unique IDs
    floatCounter: 0,
    
    // Track last update values to avoid unnecessary DOM updates
    lastValues: {},
    
    // Throttle visual updates
    lastVisualUpdate: 0,
    visualUpdateInterval: 500, // Update visual elements every 500ms

    // Initialize UI
    init() {
        this.bindEvents();
        this.updateAll();
    },

    // Bind all event listeners
    bindEvents() {
        // Manual action buttons
        document.getElementById('btn-gather-grass')?.addEventListener('click', () => {
            Resources.gatherGrass();
            this.flashButton('btn-gather-grass');
        });
        
        document.getElementById('btn-gather-reeds')?.addEventListener('click', () => {
            Resources.gatherReeds();
            this.flashButton('btn-gather-reeds');
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Building categories
        document.querySelectorAll('.build-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.setBuildingCategory(category);
            });
        });

        // Research branches
        document.querySelectorAll('.research-branch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const branch = e.currentTarget.dataset.branch;
                this.setResearchBranch(branch);
            });
        });

        // Footer buttons
        document.getElementById('btn-save')?.addEventListener('click', () => {
            if (SaveSystem.save()) {
                Game.log('Game saved!', 'success');
            }
        });

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            this.showModal('settings-modal');
        });

        document.getElementById('btn-migrate')?.addEventListener('click', () => {
            this.showMigrationModal();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Settings modal buttons
        document.getElementById('btn-manual-save')?.addEventListener('click', () => {
            if (SaveSystem.save()) {
                Game.log('Game saved!', 'success');
            }
        });

        document.getElementById('btn-export')?.addEventListener('click', () => {
            SaveSystem.exportSave();
        });

        document.getElementById('btn-import')?.addEventListener('click', () => {
            const saveStr = prompt('Paste your save data:');
            if (saveStr) {
                SaveSystem.importSave(saveStr);
            }
        });

        document.getElementById('btn-reset')?.addEventListener('click', () => {
            SaveSystem.resetGame();
        });

        // Settings checkboxes
        document.getElementById('setting-animations')?.addEventListener('change', (e) => {
            SaveSystem.setSetting('animations', e.target.checked);
        });

        document.getElementById('setting-floats')?.addEventListener('change', (e) => {
            SaveSystem.setSetting('floatingNumbers', e.target.checked);
        });

        // Migration modal buttons
        document.getElementById('btn-cancel-migrate')?.addEventListener('click', () => {
            this.hideModal('migration-modal');
        });

        document.getElementById('btn-confirm-migrate')?.addEventListener('click', () => {
            Prestige.migrate();
            this.hideModal('migration-modal');
            this.updateAll();
        });
    },

    // Flash button on click
    flashButton(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.add('clicked');
            setTimeout(() => btn.classList.remove('clicked'), 200);
        }
    },

    // Switch tab
    switchTab(tabId) {
        this.activeTab = tabId;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `panel-${tabId}`);
        });
        
        // Update content
        this.updateTabContent();
    },

    // Set building category filter
    setBuildingCategory(category) {
        this.buildingCategory = category;
        this.lastValues.buildingsHash = null; // Force refresh
        
        document.querySelectorAll('.build-cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.updateBuildingsPanel();
    },

    // Set research branch
    setResearchBranch(branch) {
        this.researchBranch = branch;
        this.lastValues.researchHash = null; // Force refresh
        
        document.querySelectorAll('.research-branch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.branch === branch);
        });
        
        this.updateResearchPanel();
    },

    // Update all UI elements
    updateAll() {
        this.updateHeader();
        this.updateResources();
        this.updateTabContent();
        this.updateFooter();
        
        // Throttle visual settlement updates
        const now = Date.now();
        if (now - this.lastVisualUpdate >= this.visualUpdateInterval) {
            this.updateSettlementView();
            this.lastVisualUpdate = now;
        }
    },

    // Update header display (optimized)
    updateHeader() {
        // Season (only update if changed)
        const seasonInfo = Seasons.getSeasonInfo();
        if (this.lastValues.season !== seasonInfo.season) {
            const seasonEl = document.getElementById('season-display');
            if (seasonEl) {
                seasonEl.className = `season ${seasonInfo.season}`;
                seasonEl.querySelector('.season-icon').textContent = seasonInfo.icon;
                seasonEl.querySelector('.season-name').textContent = seasonInfo.name;
            }
            this.lastValues.season = seasonInfo.season;
        }
        
        // Day (only update if changed)
        const currentDay = Seasons.getDay();
        if (this.lastValues.day !== currentDay) {
            const dayEl = document.getElementById('day-count');
            if (dayEl) {
                dayEl.textContent = currentDay;
            }
            this.lastValues.day = currentDay;
        }
        
        // Weather (only update if changed)
        const weatherInfo = Seasons.getWeatherInfo();
        if (this.lastValues.weather !== weatherInfo.weather) {
            const weatherEl = document.getElementById('weather-display');
            if (weatherEl) {
                weatherEl.textContent = weatherInfo.icon;
                weatherEl.title = weatherInfo.name;
            }
            this.lastValues.weather = weatherInfo.weather;
        }
        
        // Weather forecast from birds (only show when birds are visiting)
        const forecast = Visitors.getWeatherForecast();
        const hasForecast = forecast !== null;
        if (this.lastValues.hasForecast !== hasForecast || (hasForecast && this.lastValues.forecastWeather !== forecast.name)) {
            const forecastEl = document.getElementById('weather-forecast');
            if (forecastEl) {
                if (hasForecast) {
                    forecastEl.classList.remove('hidden');
                    forecastEl.innerHTML = `<span class="forecast-label">🐦 Next:</span> ${forecast.icon}`;
                    forecastEl.title = `Birds predict: ${forecast.name}`;
                } else {
                    forecastEl.classList.add('hidden');
                }
            }
            this.lastValues.hasForecast = hasForecast;
            this.lastValues.forecastWeather = hasForecast ? forecast.name : null;
        }
        
        // Time of day (only update if changed)
        const timeInfo = Seasons.getTimeInfo();
        if (this.lastValues.isNight !== timeInfo.isNight) {
            const timeEl = document.getElementById('time-display');
            if (timeEl) {
                timeEl.className = `time ${timeInfo.isNight ? 'night' : 'day'}`;
                timeEl.querySelector('.time-icon').textContent = timeInfo.icon;
            }
            this.lastValues.isNight = timeInfo.isNight;
        }
    },

    // Update resources panel (optimized to avoid unnecessary DOM updates)
    updateResources() {
        const visibleResources = Resources.getVisible();
        
        for (const [id, resource] of Object.entries(visibleResources)) {
            const el = document.getElementById(`res-${id}`);
            if (!el) continue;
            
            // Show element
            el.classList.remove('hidden');
            
            // Only update DOM if value changed
            const amountKey = `res_${id}_amount`;
            const flooredAmount = Math.floor(resource.amount);
            if (this.lastValues[amountKey] !== flooredAmount) {
                const amountEl = el.querySelector('.res-amount');
                if (amountEl) {
                    amountEl.textContent = flooredAmount;
                }
                this.lastValues[amountKey] = flooredAmount;
            }
            
            // Update max (rarely changes)
            const maxKey = `res_${id}_max`;
            if (this.lastValues[maxKey] !== resource.max) {
                const maxEl = el.querySelector('.res-max');
                if (maxEl) {
                    maxEl.textContent = `/ ${resource.max}`;
                }
                this.lastValues[maxKey] = resource.max;
            }
            
            // Update rate
            const rate = resource.rate * 10; // Per second
            const rateKey = `res_${id}_rate`;
            const rateFixed = rate.toFixed(1);
            if (this.lastValues[rateKey] !== rateFixed) {
                const rateEl = el.querySelector('.res-rate');
                if (rateEl) {
                    const sign = rate >= 0 ? '+' : '';
                    rateEl.textContent = `${sign}${rateFixed}/s`;
                    rateEl.className = `res-rate ${rate > 0 ? 'positive' : rate < 0 ? 'negative' : ''}`;
                }
                this.lastValues[rateKey] = rateFixed;
            }
        }
        
        // Update warmth bar
        const warmthPercent = HotSprings.getWarmthPercent();
        if (this.lastValues.warmthPercent !== warmthPercent) {
            const warmthFill = document.querySelector('#res-warmth .warmth-fill');
            const warmthPercentEl = document.querySelector('#res-warmth .warmth-percent');
            
            if (warmthFill) {
                warmthFill.style.width = `${warmthPercent}%`;
            }
            if (warmthPercentEl) {
                warmthPercentEl.textContent = `${warmthPercent}%`;
            }
            this.lastValues.warmthPercent = warmthPercent;
        }
        
        // Update happiness
        const happiness = Math.round(Population.calculateHappiness());
        if (this.lastValues.happiness !== happiness) {
            const happinessEl = document.querySelector('#res-happiness .res-amount');
            if (happinessEl) {
                happinessEl.textContent = happiness;
            }
            this.lastValues.happiness = happiness;
        }
        
        // Show crafted resources group if any are visible
        const craftedGroup = document.getElementById('crafted-resources');
        if (craftedGroup) {
            const hasCrafted = ['mats', 'pottery', 'herbs'].some(id => Resources.isVisible(id));
            craftedGroup.classList.toggle('hidden', !hasCrafted);
        }
        
        // Show science if unlocked
        if (Research.isUnlocked()) {
            document.getElementById('res-science')?.classList.remove('hidden');
        }
    },

    // Update current tab content
    updateTabContent() {
        switch (this.activeTab) {
            case 'population':
                this.updatePopulationPanel();
                break;
            case 'build':
                this.updateBuildingsPanel();
                break;
            case 'springs':
                this.updateSpringsPanel();
                break;
            case 'research':
                this.updateResearchPanel();
                break;
            case 'visitors':
                this.updateVisitorsPanel();
                break;
        }
    },

    // Update population panel (optimized)
    updatePopulationPanel() {
        // Population counts - only update if changed
        const popTotal = Population.getTotal();
        const popMax = Population.maxPopulation;
        const adults = Population.adults;
        const pups = Population.pups;
        const idle = Population.getIdle();
        
        if (this.lastValues.popTotal !== popTotal) {
            document.getElementById('pop-current').textContent = popTotal;
            this.lastValues.popTotal = popTotal;
        }
        if (this.lastValues.popMax !== popMax) {
            document.getElementById('pop-max').textContent = popMax;
            this.lastValues.popMax = popMax;
        }
        if (this.lastValues.adults !== adults) {
            document.getElementById('stat-adults').textContent = adults;
            this.lastValues.adults = adults;
        }
        if (this.lastValues.pups !== pups) {
            document.getElementById('stat-pups').textContent = pups;
            this.lastValues.pups = pups;
        }
        if (this.lastValues.idle !== idle) {
            document.getElementById('stat-idle').textContent = idle;
            this.lastValues.idle = idle;
        }
        
        // Growth progress
        const growthProgress = Population.getGrowthProgress();
        if (this.lastValues.growthProgress !== Math.floor(growthProgress)) {
            const growthEl = document.getElementById('growth-progress');
            if (growthEl) {
                growthEl.style.width = `${growthProgress}%`;
            }
            this.lastValues.growthProgress = Math.floor(growthProgress);
        }
        
        // Jobs list - only re-render if jobs changed
        const jobsHash = this.getJobsHash();
        if (this.lastValues.jobsHash !== jobsHash) {
            const jobsList = document.getElementById('jobs-list');
            if (jobsList) {
                const jobs = Population.getJobs();
                jobsList.innerHTML = jobs.map(job => this.renderJobItem(job)).join('');
                
                // Bind job buttons
                jobsList.querySelectorAll('.job-btn-minus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.currentTarget.dataset.job;
                        Population.unassignJob(jobId);
                        this.lastValues.jobsHash = null; // Force refresh
                        this.updatePopulationPanel();
                    });
                });
                
                jobsList.querySelectorAll('.job-btn-plus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const jobId = e.currentTarget.dataset.job;
                        Population.assignJob(jobId);
                        this.lastValues.jobsHash = null; // Force refresh
                        this.updatePopulationPanel();
                    });
                });
            }
            this.lastValues.jobsHash = jobsHash;
        }
        
        // Happiness factors - only update occasionally
        const now = Date.now();
        if (!this.lastValues.happinessUpdate || now - this.lastValues.happinessUpdate > 1000) {
            const factorsEl = document.getElementById('happiness-factors');
            if (factorsEl) {
                const factors = Population.getHappinessFactors();
                factorsEl.innerHTML = factors.map(f => `
                    <div class="happiness-factor ${f.positive === true ? 'positive' : f.positive === false ? 'negative' : ''}">
                        <span>${f.name}</span>
                        <span>${f.value > 0 ? '+' : ''}${f.value}</span>
                    </div>
                `).join('');
            }
            this.lastValues.happinessUpdate = now;
        }
    },
    
    // Generate a hash of job counts to detect changes
    getJobsHash() {
        const jobs = Population.getJobs();
        return jobs.map(j => `${j.id}:${j.count}`).join(',') + ':' + Population.getIdle();
    },

    // Render job item HTML
    renderJobItem(job) {
        const canAdd = Population.getIdle() > 0;
        const canRemove = job.count > 0;
        
        return `
            <div class="job-item">
                <div class="job-info">
                    <span class="job-name">${job.icon} ${job.name}</span>
                    <span class="job-effect">${job.description}</span>
                </div>
                <button class="job-btn job-btn-minus" data-job="${job.id}" ${!canRemove ? 'disabled' : ''}>-</button>
                <span class="job-count">${job.count}</span>
                <button class="job-btn job-btn-plus" data-job="${job.id}" ${!canAdd ? 'disabled' : ''}>+</button>
            </div>
        `;
    },

    // Update buildings panel (with caching to prevent focus loss)
    updateBuildingsPanel() {
        const buildingsList = document.getElementById('buildings-list');
        if (!buildingsList) return;
        
        const buildings = Buildings.getBuildings(this.buildingCategory);
        
        // Generate hash to detect changes
        const buildingsHash = this.getBuildingsHash(buildings);
        if (this.lastValues.buildingsHash === buildingsHash && this.lastValues.buildingsCategory === this.buildingCategory) {
            return; // No changes, don't re-render
        }
        
        if (buildings.length === 0) {
            buildingsList.innerHTML = '<p class="empty-message">No buildings available in this category</p>';
            this.lastValues.buildingsHash = buildingsHash;
            this.lastValues.buildingsCategory = this.buildingCategory;
            return;
        }
        
        buildingsList.innerHTML = buildings.map(b => this.renderBuildingItem(b)).join('');
        
        // Bind build buttons
        buildingsList.querySelectorAll('.building-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const buildingId = e.currentTarget.dataset.building;
                if (Buildings.build(buildingId)) {
                    this.lastValues.buildingsHash = null; // Force refresh
                    this.updateAll();
                }
            });
        });
        
        this.lastValues.buildingsHash = buildingsHash;
        this.lastValues.buildingsCategory = this.buildingCategory;
    },
    
    // Generate hash for buildings to detect changes
    getBuildingsHash(buildings) {
        return buildings.map(b => `${b.id}:${b.count}:${b.affordable}:${b.unlocked}`).join(',');
    },

    // Render building item HTML
    renderBuildingItem(building) {
        const classes = [
            'building-item',
            !building.unlocked ? 'locked' : '',
            building.affordable && building.unlocked ? 'affordable' : '',
            building.maxed ? 'maxed' : ''
        ].filter(Boolean).join(' ');
        
        const costHtml = Object.entries(building.cost).map(([resId, amount]) => {
            const hasEnough = Resources.get(resId) >= amount;
            return `<span class="cost-item ${!hasEnough ? 'insufficient' : ''}">${Resources.types[resId]?.icon || ''} ${amount}</span>`;
        }).join('');
        
        return `
            <div class="${classes}" data-building="${building.id}">
                <div class="building-header">
                    <span class="building-name">${building.icon} ${building.name}</span>
                    <span class="building-count">${building.count}${building.max ? '/' + building.max : ''}</span>
                </div>
                <div class="building-effect">${building.description}</div>
                ${Object.keys(building.cost).length > 0 ? `<div class="building-cost">${costHtml}</div>` : ''}
            </div>
        `;
    },

    // Update springs panel (with caching)
    updateSpringsPanel() {
        // Warmth bar - only update if changed
        const warmthPercent = HotSprings.getWarmthPercent();
        if (this.lastValues.springsWarmth !== warmthPercent) {
            const warmthBar = document.getElementById('warmth-bar-large');
            if (warmthBar) {
                warmthBar.style.width = `${warmthPercent}%`;
            }
            this.lastValues.springsWarmth = warmthPercent;
        }
        
        // Warmth stats - only update if changed
        const warmthGen = HotSprings.getWarmthGeneration().toFixed(1);
        const warmthCons = HotSprings.getWarmthConsumption().toFixed(1);
        if (this.lastValues.warmthGen !== warmthGen) {
            document.getElementById('warmth-gen').textContent = `+${warmthGen}`;
            this.lastValues.warmthGen = warmthGen;
        }
        if (this.lastValues.warmthCons !== warmthCons) {
            document.getElementById('warmth-cons').textContent = `-${warmthCons}`;
            this.lastValues.warmthCons = warmthCons;
        }
        
        // Springs list - only re-render if changed
        const springs = HotSprings.getSprings();
        const springsHash = springs.map(s => `${s.id}:${s.occupancy}`).join(',');
        if (this.lastValues.springsHash !== springsHash) {
            const springsList = document.getElementById('springs-list');
            if (springsList) {
                if (springs.length === 0) {
                    springsList.innerHTML = '<p class="empty-message">No hot springs discovered yet...</p>';
                } else {
                    springsList.innerHTML = springs.map(s => `
                        <div class="spring-item">
                            <div class="spring-header">
                                <span class="spring-name">♨️ ${HotSprings.getSpringTypeName(s.type)}</span>
                            </div>
                            <div class="spring-stats">
                                <span>Capacity: ${s.occupancy}/${s.capacity}</span>
                                <span>Warmth: +${s.warmthGeneration}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
            this.lastValues.springsHash = springsHash;
        }
        
        // Soaking list - only update if changed
        const soakingCount = HotSprings.getSoakingCount();
        if (this.lastValues.soakingCount !== soakingCount) {
            const soakingList = document.getElementById('soaking-list');
            if (soakingList) {
                if (soakingCount === 0) {
                    soakingList.innerHTML = '<p class="empty-message">No one is soaking right now</p>';
                } else {
                    soakingList.innerHTML = `<p>${soakingCount} capybara${soakingCount > 1 ? 's' : ''} soaking <img src="assets/sprites/capybara-soaking.svg" alt="soaking" class="inline-capybara"></p>`;
                }
            }
            this.lastValues.soakingCount = soakingCount;
        }
    },

    // Update research panel (with caching)
    updateResearchPanel() {
        const lockedEl = document.getElementById('research-locked');
        const unlockedEl = document.getElementById('research-unlocked');
        
        if (Research.isUnlocked()) {
            lockedEl?.classList.add('hidden');
            unlockedEl?.classList.remove('hidden');
            
            // Generate hash to detect changes
            const techs = Research.getTechnologiesByBranch(this.researchBranch);
            const scienceAmount = Math.floor(Resources.get('science'));
            const researchHash = techs.map(t => `${t.id}:${t.researched}:${t.available}`).join(',') + ':' + scienceAmount + ':' + this.researchBranch;
            
            if (this.lastValues.researchHash === researchHash) {
                return; // No changes
            }
            
            // Render research tree for current branch
            const treeEl = document.getElementById('research-tree');
            if (treeEl) {
                treeEl.innerHTML = techs.map(tech => `
                    <div class="research-item ${tech.researched ? 'researched' : tech.available ? 'available' : 'locked'}" 
                         data-tech="${tech.id}">
                        <div class="research-name">${tech.name}</div>
                        <div class="research-desc">${tech.description}</div>
                        ${!tech.researched ? `<div class="research-cost">Cost: ${tech.cost.science} Science</div>` : '<div class="research-cost">✓ Researched</div>'}
                    </div>
                `).join('');
                
                // Bind research clicks
                treeEl.querySelectorAll('.research-item.available').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const techId = e.currentTarget.dataset.tech;
                        if (Research.research(techId)) {
                            this.lastValues.researchHash = null; // Force refresh
                            this.updateAll();
                        }
                    });
                });
            }
            
            this.lastValues.researchHash = researchHash;
        } else {
            lockedEl?.classList.remove('hidden');
            unlockedEl?.classList.add('hidden');
        }
    },

    // Update visitors panel (with caching)
    updateVisitorsPanel() {
        // Current visitors - these have timers so we need to update more frequently
        // But only re-render the list structure if visitors changed
        const visitors = Visitors.getCurrentVisitors();
        const visitorsHash = visitors.map(v => v.id).join(',');
        
        const currentEl = document.getElementById('current-visitors');
        if (currentEl) {
            if (this.lastValues.visitorsHash !== visitorsHash) {
                // Full re-render when visitors change
                if (visitors.length === 0) {
                    currentEl.innerHTML = '<p class="empty-message">No visitors yet. Build more to attract friends!</p>';
                } else {
                    currentEl.innerHTML = visitors.map(v => `
                        <div class="visitor-item" data-visitor-id="${v.id}">
                            <span class="visitor-icon">${v.icon}</span>
                            <div class="visitor-info">
                                <span class="visitor-name">${v.name}</span>
                                <span class="visitor-bonus">${v.description}</span>
                            </div>
                            <span class="visitor-time">${Math.ceil(v.timeRemaining)}s</span>
                        </div>
                    `).join('');
                }
                this.lastValues.visitorsHash = visitorsHash;
            } else if (visitors.length > 0) {
                // Just update the timers without re-rendering
                visitors.forEach(v => {
                    const item = currentEl.querySelector(`[data-visitor-id="${v.id}"] .visitor-time`);
                    if (item) {
                        item.textContent = `${Math.ceil(v.timeRemaining)}s`;
                    }
                });
            }
        }
        
        // Visitor history - only update when encountered list changes
        const encountered = Visitors.getEncounteredSpecies();
        const encounteredHash = encountered.map(v => v.id).join(',');
        
        if (this.lastValues.encounteredHash !== encounteredHash) {
            const historyEl = document.getElementById('visitor-history');
            if (historyEl) {
                if (encountered.length === 0) {
                    historyEl.innerHTML = '<p class="empty-message">No species encountered yet</p>';
                } else {
                    historyEl.innerHTML = encountered.map(v => `
                        <div class="visitor-item">
                            <span class="visitor-icon">${v.icon}</span>
                            <div class="visitor-info">
                                <span class="visitor-name">${v.name}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
            this.lastValues.encounteredHash = encounteredHash;
        }
    },

    // Update footer
    updateFooter() {
        // Productivity
        const productivity = Game.getProductivity();
        const prodEl = document.getElementById('productivity-value');
        if (prodEl) {
            prodEl.textContent = `${Math.round(productivity * 100)}%`;
            prodEl.style.color = productivity >= 1 ? 'var(--color-success)' : 'var(--color-warning)';
        }
        
        // Legacy points
        if (Prestige.legacyPoints > 0 || Prestige.migrationCount > 0) {
            const legacyDisplay = document.getElementById('legacy-display');
            const legacyValue = document.getElementById('legacy-value');
            legacyDisplay?.classList.remove('hidden');
            if (legacyValue) {
                legacyValue.textContent = Prestige.legacyPoints;
            }
        }
        
        // Migration button
        if (Prestige.isMigrationUnlocked()) {
            document.getElementById('btn-migrate')?.classList.remove('hidden');
        }
    },

    // Update settlement view (visual game area) - optimized
    updateSettlementView() {
        // Update season class on settlement (only if changed)
        const currentSeason = Seasons.getCurrentSeason();
        const timePhase = Seasons.getTimePhase();
        const currentWeather = Seasons.getCurrentWeather();
        
        const settlementView = document.getElementById('settlement-view');
        if (settlementView) {
            const newClass = `season-${currentSeason} time-${timePhase}${currentWeather === 'rain' ? ' weather-rain' : ''}`;
            
            if (this.lastValues.settlementClass !== newClass) {
                settlementView.className = newClass;
                this.lastValues.settlementClass = newClass;
            }
        }
        
        // Update hot springs visual (only if count changed)
        const springCount = HotSprings.springs.length;
        if (this.lastValues.springCount !== springCount) {
            this.renderHotSprings();
            this.lastValues.springCount = springCount;
        }
        
        // Update buildings visual (handled internally with lastBuildingCount)
        this.renderBuildings();
        
        // Update capybaras (only if count changed)
        const capyCount = Population.getTotal();
        const soakCount = HotSprings.getSoakingCount();
        if (this.lastValues.capyCount !== capyCount || this.lastValues.soakCount !== soakCount) {
            this.renderCapybaras();
            this.lastValues.capyCount = capyCount;
            this.lastValues.soakCount = soakCount;
        }
        
        // Update visitors (only if changed)
        const visitorIds = Visitors.getCurrentVisitors().map(v => v.id).join(',');
        if (this.lastValues.visitorIds !== visitorIds) {
            this.renderVisitors();
            this.lastValues.visitorIds = visitorIds;
        }
    },

    // Render hot springs in settlement view
    renderHotSprings() {
        const container = document.getElementById('hot-springs-area');
        if (!container) return;
        
        const springs = HotSprings.getSprings();
        
        container.innerHTML = springs.map(s => `
            <div class="hot-spring ${s.type}">
                <div class="steam-container">
                    <div class="steam"></div>
                    <div class="steam"></div>
                    <div class="steam"></div>
                </div>
            </div>
        `).join('');
    },

    // Building positions cache
    buildingPositions: {},
    lastBuildingCount: 0,
    
    // Render buildings in settlement view
    renderBuildings() {
        const container = document.getElementById('buildings-area');
        if (!container) return;
        
        const buildingIcons = {
            grassPile: '🌿',
            reedBundle: '🌾',
            reedShelter: '🏚️',
            clayPit: '🕳️',
            wovenLodge: '🏠',
            workshop: '🔨',
            storageHut: '🏚️',
            riversideGrove: '🌳',
            fishingPond: '🎣',
            dryingRack: '🐟',
            potteryKiln: '🏺',
            woodenLonghouse: '🏡',
            bathhouse: '🏛️',
            councilCircle: '🪨',
            library: '📚',
            quarry: '⛏️',
            stoneYard: '🪨',
            tradingPost: '🏪',
            healersHut: '🏥',
            herbGarden: '🌱',
            stoneManor: '🏰',
            grandOnsen: '🏯',
            greatHall: '🏛️',
            observatory: '🔭'
        };
        
        // Count total buildings
        let totalBuildings = 0;
        const buildingList = [];
        
        for (const [id, count] of Object.entries(Buildings.counts)) {
            if (count > 0 && buildingIcons[id]) {
                for (let i = 0; i < Math.min(count, 3); i++) {
                    const key = `${id}_${i}`;
                    buildingList.push({ id, key, icon: buildingIcons[id] });
                    totalBuildings++;
                }
            }
        }
        
        // Only re-render if building count changed
        if (totalBuildings === this.lastBuildingCount && container.children.length > 0) {
            return;
        }
        this.lastBuildingCount = totalBuildings;
        
        // Generate stable positions
        buildingList.forEach((b, index) => {
            if (!this.buildingPositions[b.key]) {
                this.buildingPositions[b.key] = {
                    left: 5 + (index * 12) % 90,
                    bottom: 0
                };
            }
        });
        
        let html = buildingList.map(b => {
            const pos = this.buildingPositions[b.key];
            return `
                <div class="building-visual" style="left: ${pos.left}%">
                    <span class="building-sprite">${b.icon}</span>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    },

    // Capybara position cache to prevent jarring resets
    capybaraPositions: {},
    visitorPositions: {},
    capybaraYuzu: {}, // Track which soaking capybaras have yuzu on their heads
    yuzuClickCounts: {}, // Track clicks needed to remove yuzu
    
    // Render capybaras in settlement view
    renderCapybaras() {
        const container = document.getElementById('capybaras-area');
        if (!container) return;
        
        const total = Math.min(Population.getTotal(), 10); // Max 10 visible
        const soaking = HotSprings.getSoakingCount();
        
        // Generate stable positions for each capybara
        for (let i = 0; i < total; i++) {
            if (!this.capybaraPositions[i]) {
                this.capybaraPositions[i] = {
                    left: 10 + (i * 8) + (Math.random() * 5),
                    bottom: 5 + Math.random() * 25
                };
            }
        }
        
        // Assign yuzu to soaking capybaras (20% chance when they start soaking)
        for (let i = 0; i < soaking; i++) {
            if (this.capybaraYuzu[i] === undefined) {
                // 20% chance for soaking capybara to get a yuzu
                this.capybaraYuzu[i] = Math.random() < 0.20;
                if (this.capybaraYuzu[i]) {
                    this.yuzuClickCounts[i] = 0; // Initialize click counter
                }
            }
        }
        
        // Remove yuzu from capybaras that stopped soaking
        for (const key of Object.keys(this.capybaraYuzu)) {
            const idx = parseInt(key);
            if (idx >= soaking) {
                delete this.capybaraYuzu[key];
                delete this.yuzuClickCounts[key];
            }
        }
        
        // Remove positions for capybaras that no longer exist
        for (const key of Object.keys(this.capybaraPositions)) {
            if (parseInt(key) >= total) {
                delete this.capybaraPositions[key];
            }
        }
        
        let html = '';
        for (let i = 0; i < total; i++) {
            const isSoaking = i < soaking;
            const pos = this.capybaraPositions[i];
            const hasYuzu = isSoaking && this.capybaraYuzu[i];
            
            html += `
                <div class="capybara ${isSoaking ? 'soaking' : 'idle'}${hasYuzu ? ' has-yuzu' : ''}" 
                     style="left: ${pos.left}%; bottom: ${pos.bottom}%"
                     data-capy-id="${i}">
                    ${hasYuzu ? '<div class="yuzu-on-head">🍊</div>' : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // Add click handlers for yuzu removal easter egg
        container.querySelectorAll('.capybara.has-yuzu').forEach(capy => {
            capy.addEventListener('click', (e) => this.handleYuzuClick(e));
        });
    },
    
    // Easter egg: clicking capybara with yuzu multiple times removes it
    handleYuzuClick(e) {
        const capy = e.currentTarget;
        const capyId = parseInt(capy.dataset.capyId);
        const yuzu = capy.querySelector('.yuzu-on-head');
        
        if (yuzu && this.capybaraYuzu[capyId]) {
            // Increment click counter
            this.yuzuClickCounts[capyId] = (this.yuzuClickCounts[capyId] || 0) + 1;
            
            // Wobble the yuzu on each click
            yuzu.classList.add('wobble');
            setTimeout(() => yuzu.classList.remove('wobble'), 200);
            
            // Need 3 clicks to remove the yuzu
            if (this.yuzuClickCounts[capyId] >= 3) {
                yuzu.classList.add('falling');
                
                // Remove yuzu after animation
                setTimeout(() => {
                    delete this.capybaraYuzu[capyId];
                    delete this.yuzuClickCounts[capyId];
                    capy.classList.remove('has-yuzu');
                    yuzu.remove();
                    Game.log('🍊 *plop* The yuzu rolled into the water!', 'event');
                }, 500);
            }
        }
    },

    // Render visitors in settlement view
    renderVisitors() {
        const container = document.getElementById('visitors-area');
        if (!container) return;
        
        const visitors = Visitors.getCurrentVisitors();
        
        // Generate stable positions for visitors
        for (const v of visitors) {
            if (!this.visitorPositions[v.id]) {
                this.visitorPositions[v.id] = {
                    left: 15 + Math.random() * 70,
                    top: 20 + Math.random() * 40
                };
            }
        }
        
        // Clean up positions for visitors that left
        const currentIds = visitors.map(v => v.id);
        for (const key of Object.keys(this.visitorPositions)) {
            if (!currentIds.includes(key)) {
                delete this.visitorPositions[key];
            }
        }
        
        container.innerHTML = visitors.map(v => {
            const pos = this.visitorPositions[v.id];
            return `<div class="visitor-animal" style="left: ${pos.left}%; top: ${pos.top}%" data-visitor="${v.id}">${v.icon}</div>`;
        }).join('');
    },

    // Show floating text
    showFloatingText(text, type = 'positive') {
        if (!SaveSystem.getSetting('floatingNumbers')) return;
        
        const container = document.getElementById('float-notifications');
        if (!container) return;
        
        const el = document.createElement('div');
        el.className = `float-text ${type}`;
        el.textContent = text;
        el.style.left = `${30 + Math.random() * 40}%`;
        el.style.top = `${30 + Math.random() * 30}%`;
        
        container.appendChild(el);
        
        setTimeout(() => el.remove(), 1500);
    },

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Force reflow to trigger transition
            modal.offsetHeight;
        }
    },

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    // Show migration modal with details
    showMigrationModal() {
        const { breakdown, total } = Prestige.calculateLegacyPoints();
        
        // Update breakdown
        const breakdownEl = document.getElementById('legacy-breakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = breakdown.map(item => `
                <div class="stat-row">
                    <span>${item.name}</span>
                    <span>+${item.value} (${item.detail})</span>
                </div>
            `).join('');
        }
        
        // Update total
        const totalEl = document.getElementById('legacy-total');
        if (totalEl) {
            totalEl.textContent = total;
        }
        
        // Update upgrades list
        const upgradesEl = document.getElementById('legacy-upgrades-list');
        if (upgradesEl) {
            const upgrades = Prestige.getUpgrades();
            upgradesEl.innerHTML = upgrades.map(u => {
                const classes = [
                    'legacy-upgrade',
                    u.purchased ? 'purchased' : '',
                    u.affordable && !u.purchased ? 'affordable' : ''
                ].filter(Boolean).join(' ');
                
                return `
                    <div class="${classes}" data-upgrade="${u.id}">
                        <div>
                            <div class="upgrade-name">${u.name}</div>
                            <div class="upgrade-desc">${u.description}</div>
                        </div>
                        <div class="upgrade-cost">${u.purchased ? '✓' : `${u.cost} LP`}</div>
                    </div>
                `;
            }).join('');
            
            // Bind upgrade purchases
            upgradesEl.querySelectorAll('.legacy-upgrade:not(.purchased)').forEach(el => {
                el.addEventListener('click', (e) => {
                    const upgradeId = e.currentTarget.dataset.upgrade;
                    if (Prestige.purchaseUpgrade(upgradeId)) {
                        this.showMigrationModal(); // Refresh
                    }
                });
            });
        }
        
        this.showModal('migration-modal');
    }
};


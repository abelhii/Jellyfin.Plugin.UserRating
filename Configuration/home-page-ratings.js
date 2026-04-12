/**
 * Home page module
 * Handles ratings tab injection and display of all rated items on home page
 */

const HomePageRatings = {
    ratingsTabExists: false,
    isDisplayingList: false,

    /**
     * Inject the ratings tab into the home page tabs
     */
    injectRatingsTab() {
        try {
            // Only on home page
            if (!window.location.hash.includes('home')) {
                return;
            }

            // Check if already injected
            if (this.ratingsTabExists || document.querySelector('[data-ratings-tab="true"]')) {
                return;
            }

            // Find tabs container
            const homeButton = Array.from(document.querySelectorAll('.emby-tab-button')).find(btn =>
                btn.textContent.trim().toLowerCase().includes('home')
            );

            let tabsSlider = homeButton?.parentElement || document.querySelector('.emby-tabs-slider');

            if (!tabsSlider) {
                return;
            }

            const existingTabs = tabsSlider.querySelectorAll('.emby-tab-button');
            const nextIndex = existingTabs.length;

            // Create ratings tab
            const ratingsTab = document.createElement('button');
            ratingsTab.type = 'button';
            ratingsTab.setAttribute('is', 'emby-button');
            ratingsTab.className = 'emby-tab-button emby-button';
            ratingsTab.setAttribute('data-index', nextIndex);
            ratingsTab.setAttribute('data-ratings-tab', 'true');
            ratingsTab.innerHTML = '<div class="emby-button-foreground">User Ratings</div>';

            // Tab click handler
            ratingsTab.addEventListener('click', async (e) => {
                e.preventDefault();

                // Update active state
                tabsSlider.querySelectorAll('.emby-tab-button').forEach(tab => {
                    tab.classList.remove('emby-tab-button-active');
                });
                ratingsTab.classList.add('emby-tab-button-active');

                try {
                    await this.displayRatingsList();
                } catch (error) {
                    console.error('[UserRatings] Error displaying ratings list:', error);
                }
            });

            // Add listeners to other tabs to properly switch content
            const otherTabs = tabsSlider.querySelectorAll('.emby-tab-button:not([data-ratings-tab="true"])');
            otherTabs.forEach((tab) => {
                tab.addEventListener('click', () => {
                    const ratingsTabContent = document.querySelector('#ratingsTab');
                    if (ratingsTabContent) {
                        ratingsTabContent.style.display = 'none';
                        ratingsTabContent.classList.add('hide');
                    }

                    const homePage = document.querySelector('[data-role="page"].hide:not(#ratingsTab)');
                    if (homePage) {
                        homePage.classList.remove('hide');
                    }
                }, true);
            });

            // Add tab to slider
            tabsSlider.appendChild(ratingsTab);
            this.ratingsTabExists = true;

        } catch (error) {
            console.error('[UserRatings] Tab injection error:', error);
        }
    },

    /**
     * Load plugin configuration
     */
    async loadPluginConfig() {
        try {
            const config = await ApiClient.getPluginConfiguration('b8c5d3e7-4f6a-8b9c-1d2e-3f4a5b6c7d8e');
            return config.RecentlyRatedItemsCount || 10;
        } catch (error) {
            console.warn('[UserRatings] Could not load plugin config, using default:', error);
            return 10;
        }
    },

    /**
     * Display the ratings list on home page
     */
    async displayRatingsList() {
        if (this.isDisplayingList) return;
        this.isDisplayingList = true;

        try {
            // Get or create ratings tab content container
            let ratingsTabContent = document.querySelector('#ratingsTab');

            if (!ratingsTabContent) {
                const homePage = document.querySelector('[data-role="page"]:not(.hide)');
                if (!homePage) {
                    console.error('[UserRatings] Could not find home page');
                    this.isDisplayingList = false;
                    return;
                }

                ratingsTabContent = document.createElement('div');
                ratingsTabContent.id = 'ratingsTab';
                ratingsTabContent.className = 'page homePage libraryPage hide';
                ratingsTabContent.setAttribute('data-role', 'page');
                ratingsTabContent.style.position = 'absolute';
                ratingsTabContent.style.top = '0';
                ratingsTabContent.style.left = '0';
                ratingsTabContent.style.right = '0';
                ratingsTabContent.style.bottom = '0';
                ratingsTabContent.style.overflow = 'auto';

                homePage.parentNode.appendChild(ratingsTabContent);
            }

            // Hide home page, show ratings tab
            const homePage = document.querySelector('[data-role="page"]:not(.hide):not(#ratingsTab)');
            if (homePage) {
                homePage.classList.add('hide');
            }

            ratingsTabContent.classList.remove('hide');
            ratingsTabContent.style.display = 'block';
            ratingsTabContent.innerHTML = '<div style="padding: 3em 2em; text-align: center; color: rgba(255,255,255,0.6);">Loading ratings...</div>';

            // Load data
            const ratingsData = await RatingsAPI.loadAllRatedItems();
            const items = ratingsData.items || [];

            if (items.length === 0) {
                ratingsTabContent.innerHTML = `
                    <div style="padding: 4em 2em; text-align: center;">
                        <div style="font-size: 4em; margin-bottom: 0.5em; opacity: 0.3;">★</div>
                        <div style="font-size: 1.2em; color: rgba(255, 255, 255, 0.6);">No rated items yet</div>
                    </div>
                `;
                this.isDisplayingList = false;
                return;
            }

            // Fetch full item details
            const itemsWithDetails = await Promise.all(
                items.map(async (item) => {
                    try {
                        const details = await ApiClient.getItem(ApiClient.getCurrentUserId(), item.itemId);
                        return { 
                            ...item, 
                            details,
                            lastRatedTimestamp: item.lastRated ? new Date(item.lastRated).getTime() : 0
                        };
                    } catch (error) {
                        console.error('[UserRatings] Error loading item:', error);
                        return null;
                    }
                })
            );

            const validItems = itemsWithDetails.filter(item => item !== null);

            if (validItems.length === 0) {
                ratingsTabContent.innerHTML = '<div style="padding: 2em; text-align: center; color: rgba(255,255,255,0.6);">Could not load item details</div>';
                this.isDisplayingList = false;
                return;
            }

            // Render the list with configured limit
            const itemsLimit = await this.loadPluginConfig();
            this.renderRatingsList(ratingsTabContent, validItems, itemsLimit);
            
            // Add click handlers to cards
            setTimeout(() => {
                const cards = ratingsTabContent.querySelectorAll('[id^="rating-card-"]');
                cards.forEach(card => {
                    card.addEventListener('click', (e) => {
                        const match = card.id.match(/rating-card-([^-]+)/);
                        if (match) {
                            const itemId = match[1];
                            const serverId = ApiClient.serverId();
                            
                            // Hide ratings tab and navigate
                            const ratingsTab = document.querySelector('#ratingsTab');
                            if (ratingsTab) {
                                ratingsTab.style.display = 'none';
                                ratingsTab.classList.add('hide');
                            }
                            
                            // Navigate to detail page
                            window.location.hash = `#/details?id=${itemId}&serverId=${serverId}`;
                        }
                    });
                });
            }, 100);
            
            this.isDisplayingList = false;

        } catch (error) {
            console.error('[UserRatings] Error displaying ratings list:', error);
            const container = document.querySelector('#ratingsTab');
            if (container) {
                container.innerHTML = `<div style="padding: 2em; color: #ff6b6b;">Error: ${error.message}</div>`;
            }
            this.isDisplayingList = false;
        }
    },

    /**
     * Render the ratings list UI
     */
    renderRatingsList(container, items, itemsLimit = 10) {
        // Apply configured limit to each category
        const sortByRecent = (a, b) => (b.lastRatedTimestamp || 0) - (a.lastRatedTimestamp || 0);
        
        const movies = items.filter(item => item.details.Type === 'Movie').sort(sortByRecent).slice(0, itemsLimit);
        const series = items.filter(item => item.details.Type === 'Series').sort(sortByRecent).slice(0, itemsLimit);
        const episodes = items.filter(item => item.details.Type === 'Episode').sort(sortByRecent).slice(0, itemsLimit);

        let html = '<div class="readOnlyContent" style="padding-top: 4em;">';

        // Movies section
        if (movies.length > 0) {
            html += `
                <div class="verticalSection">
                    <div class="sectionTitleContainer padded-left">
                        <h2 class="sectionTitle">Recently Rated Movies</h2>
                    </div>
                    <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap">
                        ${this.buildItemCards(movies)}
                    </div>
                </div>
            `;
        }

        // Series section
        if (series.length > 0) {
            html += `
                <div class="verticalSection">
                    <div class="sectionTitleContainer padded-left">
                        <h2 class="sectionTitle">Recently Rated Shows</h2>
                    </div>
                    <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap">
                        ${this.buildItemCards(series)}
                    </div>
                </div>
            `;
        }

        // Episodes section
        if (episodes.length > 0) {
            html += `
                <div class="verticalSection">
                    <div class="sectionTitleContainer padded-left">
                        <h2 class="sectionTitle">Recently Rated Episodes</h2>
                    </div>
                    <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap">
                        ${this.buildItemCards(episodes)}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Build item cards HTML
     */
    buildItemCards(items) {
        return items.map((item, index) => {
            const details = item.details;
            const imageId = details.Type === 'Episode' && details.SeriesId ? details.SeriesId : item.itemId;
            const imageUrl = ApiClient.getImageUrl(imageId, {
                type: 'Primary',
                maxHeight: 400,
                quality: 90
            });

            const title = details.Name || 'Unknown';
            const rating = (item.averageRating || 0).toFixed(1);
            const count = item.totalRatings || 0;
            const serverId = ApiClient.serverId();
            const cardId = `rating-card-${item.itemId}-${index}`;

            return `
                <div id="${cardId}" class="card portraitCard card-hoverable" style="min-width: 150px; max-width: 250px; cursor: pointer;">
                    <div class="cardBox cardBox-bottompadded">
                        <div class="cardScalable">
                            <div class="cardPadder cardPadder-portrait"></div>
                            <div class="cardImageContainer" aria-label="${title}" style="background-image: url('${imageUrl}'); cursor: pointer;"></div>
                            <div class="cardIndicators cardIndicators-bottomright">
                                <div style="background: rgba(0,0,0,0.85); padding: 0.4em 0.7em; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.3em;">
                                    <span style="color: #ffd700; font-size: 1.1em;">★</span>
                                    <span style="font-weight: 600;">${rating}</span>
                                    <span style="opacity: 0.7; font-size: 0.85em;">(${count})</span>
                                </div>
                            </div>
                        </div>
                        <div class="cardText cardTextCentered cardText-first">
                            <span title="${title}" style="cursor: pointer;">${title}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Initialize home page features
     */
    init() {
        // Initial injection
        this.injectRatingsTab();

        // Retry periodically
        setInterval(() => this.injectRatingsTab(), 2000);

        // Watch for hash changes
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.injectRatingsTab(), 100);
        });

        // Watch for DOM changes
        new MutationObserver(() => {
            this.injectRatingsTab();
        }).observe(document.body, { childList: true, subtree: true });
    }
};

// Export for use in main module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomePageRatings;
}

/**
 * Detail page injector module
 * Handles injection of ratings UI into item detail pages
 * Uses smart container detection with robust fallback mechanisms
 */

const DetailPageInjector = {
    currentItemId: null,
    isInjecting: false,
    detector: null,
    injectionAttempts: 0,
    maxInjectionAttempts: 30,
    hasTriedRefresh: false,

    /**
     * Extract item ID from URL
     */
    extractItemId() {
        let itemId = null;

        // Try query string first
        const urlParams = new URLSearchParams(window.location.search);
        itemId = urlParams.get('id');

        if (!itemId && window.location.hash.includes('?')) {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
            itemId = hashParams.get('id');
        }

        // Try GUID pattern in URL
        if (!itemId) {
            const guidMatch = window.location.href.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
            if (guidMatch) {
                itemId = guidMatch[1];
            }
        }

        return itemId;
    },

    /**
     * Check if we're currently on a details page
     */
    isOnDetailsPage() {
        const hash = window.location.hash;
        const url = window.location.href;
        return hash.includes('#/details') || hash.includes('/details') || url.includes('/details');
    },

    /**
     * Seamless page refresh as fallback
     */
    seamlessPageRefresh(force = false) {
        if (!this.isOnDetailsPage()) {
            console.log('[UserRatings] Not on details page, skipping refresh');
            return;
        }

        if (!force && this.hasTriedRefresh) {
            console.log('[UserRatings] Already tried refresh, skipping');
            return;
        }

        console.log('[UserRatings] Performing page refresh', force ? '(FORCED)' : '');
        this.hasTriedRefresh = true;
        window.location.reload(true);
    },

    /**
     * Main injection function with retry logic
     */
    async injectRatingsUI() {
        // Prevent concurrent injections
        if (this.isInjecting) {
            console.log('[UserRatings] Already injecting, skipping');
            return;
        }

        const itemId = this.extractItemId();
        if (!itemId) {
            console.log('[UserRatings] No item ID found');
            this.injectionAttempts = 0;
            return;
        }

        // Check if UI already exists for this item
        const existingUI = document.getElementById('user-ratings-ui');
        if (existingUI && this.currentItemId === itemId) {
            console.log('[UserRatings] UI already exists for this item');
            this.injectionAttempts = 0;
            return;
        }

        // Remove old UI if navigated to different item
        if (existingUI && this.currentItemId !== itemId) {
            console.log('[UserRatings] Removing UI for previous item');
            existingUI.remove();
        }

        this.currentItemId = itemId;
        this.isInjecting = true;

        try {
            console.log('[UserRatings] Waiting for detail page container...');

            // Use smart container detector
            if (!this.detector) {
                this.detector = new ContainerDetector({
                    timeout: 10000, // 10 seconds max
                    requireContent: false,
                    minSize: { width: 0, height: 0 }
                });
            }

            const targetContainer = await this.detector.waitForContainer();

            console.log('[UserRatings] Container found! Injecting UI for item:', itemId);

            // Create UI
            const ui = await RatingsUI.createRatingsUI(itemId);

            // Inject into container
            targetContainer.appendChild(ui);
            this.injectionAttempts = 0; // Reset on successful inject

            // Verify inject worked by checking if UI is visible
            const checkSizeAndRefresh = (checkName) => {
                const injectedUI = document.getElementById('user-ratings-ui');
                if (!injectedUI) return false;

                const rect = injectedUI.getBoundingClientRect();
                const hasZeroSize = rect.width === 0 && rect.height === 0;

                console.log(`[UserRatings] ${checkName} size check:`, rect.width, 'x', rect.height, hasZeroSize ? '(ZERO)' : '');

                if (hasZeroSize) {
                    const isFinalCheck = checkName === 'Final';
                    if (isFinalCheck) {
                        this.hasTriedRefresh = false; // Force refresh
                    }

                    injectedUI.remove();
                    this.isInjecting = false;
                    this.seamlessPageRefresh(isFinalCheck);
                    return true;
                }

                return false;
            };

            // Immediate check
            setTimeout(() => {
                if (!checkSizeAndRefresh('Immediate')) {
                    this.isInjecting = false;
                    console.log('[UserRatings] ✓ UI successfully injected');
                }
            }, 100);

            // Check after async operations
            setTimeout(() => {
                checkSizeAndRefresh('Post-async');
            }, 800);

            // Final check
            setTimeout(() => {
                checkSizeAndRefresh('Final');
            }, 1500);

        } catch (error) {
            console.error('[UserRatings] Error during injection:', error);
            this.isInjecting = false;

            // Retry with exponential backoff if container not found
            if (this.injectionAttempts < this.maxInjectionAttempts) {
                this.injectionAttempts++;
                const retryDelay = Math.min(100 * Math.pow(1.5, this.injectionAttempts), 3000);
                console.log(`[UserRatings] Retry ${this.injectionAttempts}/${this.maxInjectionAttempts} in ${retryDelay.toFixed(0)}ms`);
                setTimeout(() => this.injectRatingsUI(), retryDelay);
            } else {
                console.log('[UserRatings] Max injection attempts reached, attempting refresh');
                if (!this.hasTriedRefresh && itemId) {
                    this.seamlessPageRefresh();
                }
            }
        }
    },

    /**
     * Monitor and continuously re-inject UI if missing
     * Runs indefinitely to handle page refreshes and navigation
     */
    monitorUIVisibility() {
        setInterval(() => {
            // Only monitor on detail pages
            if (!this.isOnDetailsPage()) {
                return;
            }

            const ui = document.getElementById('user-ratings-ui');
            const currentItemId = this.extractItemId();

            // If we're on a detail page but UI is missing or we're on a different item, try to inject
            if (currentItemId && (!ui || this.currentItemId !== currentItemId)) {
                if (!this.isInjecting) {
                    console.log('[UserRatings] UI missing or item changed, re-injecting...');
                    this.currentItemId = currentItemId;
                    this.injectionAttempts = 0; // Reset attempts for new item
                    this.hasTriedRefresh = false; // Reset refresh flag
                    this.injectRatingsUI();
                }
                return;
            }

            // If UI exists, check if it's zero-sized
            if (ui && this.currentItemId) {
                const rect = ui.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) {
                    const parent = ui.parentElement;
                    if (parent) {
                        const parentRect = parent.getBoundingClientRect();
                        if (parentRect.width > 0 || parentRect.height > 0) {
                            console.log('[UserRatings] UI became zero-sized but parent visible, refreshing');
                            ui.remove();
                            this.isInjecting = false;
                            this.injectionAttempts = 0;
                            this.seamlessPageRefresh();
                        }
                    }
                }
            }
        }, 1000); // Check every 1 second for more responsiveness
    },

    /**
     * Clean up on page navigation
     */
    cleanup() {
        const ui = document.getElementById('user-ratings-ui');
        if (ui) {
            ui.remove();
        }

        this.currentItemId = null;
        this.isInjecting = false;
        this.injectionAttempts = 0;
        this.hasTriedRefresh = false;

        if (this.detector) {
            this.detector.reset();
        }
    },

    /**
     * Initialize injection monitoring
     */
    init() {
        // Initial attempts with delays
        setTimeout(() => this.injectRatingsUI(), 100);
        setTimeout(() => this.injectRatingsUI(), 300);
        setTimeout(() => this.injectRatingsUI(), 600);

        // Start monitoring for UI visibility issues
        this.monitorUIVisibility();

        // Listen for hash changes (navigation)
        window.addEventListener('hashchange', () => {
            this.cleanup();
            setTimeout(() => this.injectRatingsUI(), 150);
        });

        // Listen for page changes via URL
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                this.cleanup();
                setTimeout(() => this.injectRatingsUI(), 150);
            }
        }).observe(document.body, { childList: true, subtree: true });
    }
};

// Export for use in main module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DetailPageInjector;
}

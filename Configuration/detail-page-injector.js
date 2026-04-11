/**
 * Detail page injector module
 * Handles injection of ratings UI into item detail pages
 * Uses smart container detection instead of brittle retries
 */

const DetailPageInjector = {
    currentItemId: null,
    isInjecting: false,
    detector: null,

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
     * Main injection function
     * Uses container detector for smarter detection
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
            return;
        }

        // Check if UI already exists for this item
        const existingUI = document.getElementById('user-ratings-ui');
        if (existingUI && this.currentItemId === itemId) {
            console.log('[UserRatings] UI already exists for this item');
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
                    timeout: 15000, // 15 seconds
                    requireContent: true
                });
            }

            const targetContainer = await this.detector.waitForContainer();

            console.log('[UserRatings] Container found! Injecting UI for item:', itemId);

            // Create UI
            const ui = await RatingsUI.createRatingsUI(itemId);

            // Inject into container
            targetContainer.appendChild(ui);

            // Verify inject worked by checking if UI is visible
            setTimeout(() => {
                const injectedUI = document.getElementById('user-ratings-ui');
                if (injectedUI) {
                    const rect = injectedUI.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        console.log('[UserRatings] ✓ UI successfully injected and visible');
                        this.isInjecting = false;
                    } else {
                        console.warn('[UserRatings] UI injected but not visible, will retry on next page load');
                        this.isInjecting = false;
                    }
                }
            }, 500);

        } catch (error) {
            console.error('[UserRatings] Error during injection:', error);
            this.isInjecting = false;
            // Let it try again on next opportunity
        }
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

        if (this.detector) {
            this.detector.reset();
        }
    },

    /**
     * Initialize injection monitoring
     */
    init() {
        // Initial attempts
        setTimeout(() => this.injectRatingsUI(), 100);
        setTimeout(() => this.injectRatingsUI(), 300);
        setTimeout(() => this.injectRatingsUI(), 600);

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

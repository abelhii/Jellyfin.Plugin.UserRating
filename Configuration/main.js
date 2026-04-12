/**
 * Main entry point for User Ratings plugin
 * Loads styles and initializes all modules
 */

(function () {
    'use strict';

    console.log('[UserRatings] Loading plugin...');

    /**
     * Load CSS styles
     */
    function loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'plugins/UserRating/css/styles.css';
        document.head.appendChild(link);
        console.log('[UserRatings] Styles loaded');
    }

    /**
     * Wait for all modules to be available
     */
    function waitForModules(callback, maxWait = 10000) {
        const startTime = Date.now();

        const checkModules = () => {
            const hasModules = typeof RatingsAPI !== 'undefined' &&
                               typeof RatingsUI !== 'undefined' &&
                               typeof ContainerDetector !== 'undefined' &&
                               typeof DetailPageInjector !== 'undefined' &&
                               typeof HomePageRatings !== 'undefined';

            if (hasModules) {
                callback();
            } else if (Date.now() - startTime < maxWait) {
                // Retry every 50ms until timeout
                setTimeout(checkModules, 50);
            } else {
                console.error('[UserRatings] Modules failed to load within timeout');
            }
        };

        checkModules();
    }

    /**
     * Initialize all features
     */
    function initialize() {
        console.log('[UserRatings] Initializing modules...');

        try {
            // Initialize detail page injection
            DetailPageInjector.init();
            console.log('[UserRatings] ✓ Detail page injector initialized');

            // Initialize home page ratings tab
            HomePageRatings.init();
            console.log('[UserRatings] ✓ Home page ratings initialized');

            console.log('[UserRatings] ✓ Plugin fully initialized');
        } catch (error) {
            console.error('[UserRatings] Initialization error:', error);
        }
    }

    // Load styles immediately
    loadStyles();

    // Wait for modules then initialize
    waitForModules(() => {
        initialize();
    });

    // Set up window unload cleanup
    window.addEventListener('beforeunload', () => {
        if (DetailPageInjector) {
            DetailPageInjector.cleanup();
        }
    });

})();

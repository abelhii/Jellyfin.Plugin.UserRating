/**
 * Smart container detector
 * Waits for a container to be truly ready (exists, has content, is visible)
 * This replaces the brittle multi-strategy polling approach
 */

class ContainerDetector {
    constructor(options = {}) {
        this.options = {
            selectors: ['.detailPagePrimaryContent .detailSection', '.detailSection', '.detailPagePrimaryContent', '.itemDetailPage .detailPageContent'],
            timeout: options.timeout || 30000, // 30 seconds max
            checkInterval: options.checkInterval || 100, // Check every 100ms
            requireContent: options.requireContent !== false, // Default: require container to have children
            minSize: options.minSize || { width: 0, height: 0 }, // Minimum size check
            ...options
        };
        this.observer = null;
        this.attempts = 0;
    }

    /**
     * Check if a container element is "ready"
     * This is more robust than just checking for existence
     */
    isContainerReady(element) {
        if (!element) return false;

        // Must be in DOM and visible
        if (!document.contains(element)) return false;

        // Check visibility
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;

        // Check size if required
        const rect = element.getBoundingClientRect();
        if (rect.width < this.options.minSize.width || rect.height < this.options.minSize.height) {
            return false;
        }

        // Check for content if required
        if (this.options.requireContent && element.children.length === 0) {
            return false;
        }

        return true;
    }

    /**
     * Try to find a ready container using the configured selectors
     */
    findReadyContainer() {
        for (const selector of this.options.selectors) {
            const element = document.querySelector(selector);
            if (this.isContainerReady(element)) {
                console.log(`[UserRatings] Container found and ready: ${selector}`);
                return element;
            }
        }
        return null;
    }

    /**
     * Wait for a container to become ready
     * Uses reactive MutationObserver instead of polling
     */
    async waitForContainer() {
        return new Promise((resolve, reject) => {
            // First, check if container is already ready
            const existing = this.findReadyContainer();
            if (existing) {
                resolve(existing);
                return;
            }

            const startTime = Date.now();
            let found = false;

            // Set up MutationObserver to watch for container changes
            this.observer = new MutationObserver((mutations) => {
                if (found) return; // Already found

                // Check if any mutation added our target elements
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        const container = this.findReadyContainer();
                        if (container) {
                            found = true;
                            this.cleanup();
                            resolve(container);
                            return;
                        }
                    }
                }
            });

            // Start observing
            this.observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'display']
            });

            // Fallback polling in case mutations don't fire
            const pollInterval = setInterval(() => {
                if (found) {
                    clearInterval(pollInterval);
                    return;
                }

                const container = this.findReadyContainer();
                if (container) {
                    found = true;
                    clearInterval(pollInterval);
                    this.cleanup();
                    resolve(container);
                    return;
                }

                // Check timeout
                const elapsed = Date.now() - startTime;
                if (elapsed > this.options.timeout) {
                    clearInterval(pollInterval);
                    this.cleanup();
                    reject(new Error(`Container detection timeout after ${this.options.timeout}ms`));
                }
            }, this.options.checkInterval);
        });
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * Reset for next use
     */
    reset() {
        this.cleanup();
        this.attempts = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContainerDetector;
}

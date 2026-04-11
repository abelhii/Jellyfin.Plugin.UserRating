/**
 * API module for user ratings
 * Handles all HTTP requests to the ratings API
 */

const RatingsAPI = {
    /**
     * Load all ratings for an item
     */
    async loadRatings(itemId) {
        try {
            const response = await fetch(ApiClient.getUrl(`api/UserRatings/Item/${itemId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            console.log('[UserRatings] Loaded ratings:', data);
            return data;
        } catch (error) {
            console.error('[UserRatings] Error loading ratings:', error);
            return { ratings: [], averageRating: 0, totalRatings: 0 };
        }
    },

    /**
     * Load current user's rating for an item
     */
    async loadMyRating(itemId) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const response = await fetch(ApiClient.getUrl(`api/UserRatings/MyRating/${itemId}?userId=${userId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[UserRatings] Error loading my rating:', error);
            return null;
        }
    },

    /**
     * Save a new or updated rating
     */
    async saveRating(itemId, rating, note) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const user = await ApiClient.getCurrentUser();
            const userName = user ? user.Name : 'Unknown';
            const url = ApiClient.getUrl(
                `api/UserRatings/Rate?itemId=${itemId}&userId=${userId}&rating=${rating}` +
                `${note ? '&note=' + encodeURIComponent(note) : ''}` +
                `&userName=${encodeURIComponent(userName)}`
            );
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('[UserRatings] Server error:', response.status, text);
                return { success: false, message: `Server error: ${response.status}` };
            }

            return await response.json();
        } catch (error) {
            console.error('[UserRatings] Error saving rating:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Delete a rating
     */
    async deleteRating(itemId) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const url = ApiClient.getUrl(`api/UserRatings/Rating?itemId=${itemId}&userId=${userId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            return await response.json();
        } catch (error) {
            console.error('[UserRatings] Error deleting rating:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Load all items the current user has rated
     */
    async loadAllRatedItems() {
        try {
            const response = await fetch(ApiClient.getUrl('api/UserRatings/AllRatedItems'), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load ratings');
            }

            return await response.json();
        } catch (error) {
            console.error('[UserRatings] Error loading all rated items:', error);
            return { items: [] };
        }
    }
};

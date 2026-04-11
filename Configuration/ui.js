/**
 * UI module for ratings display
 * Handles creation and rendering of UI components
 */

const RatingsUI = {
    currentRating: 0,

    /**
     * Create an interactive star rating component
     */
    createStarRating(rating, interactive, onHover, onClick) {
        const container = document.createElement('div');
        container.className = 'star-rating';
        let currentSelectedRating = rating;

        for (let i = 1; i <= 10; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i <= rating ? ' filled' : '');
            star.textContent = '★';
            star.dataset.rating = i;

            if (interactive) {
                star.addEventListener('mouseenter', () => onHover(i));
                star.addEventListener('click', () => {
                    currentSelectedRating = i;
                    onClick(i);
                });
            }

            container.appendChild(star);
        }

        if (interactive) {
            container.addEventListener('mouseleave', () => onHover(currentSelectedRating));
        }

        return container;
    },

    /**
     * Update star display to show a given rating
     */
    updateStarDisplay(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    },

    /**
     * Create the main ratings UI container for an item
     * This is injected into detail pages
     */
    async createRatingsUI(itemId) {
        console.log('[UserRatings] → createRatingsUI started for:', itemId);
        const container = document.createElement('div');
        container.className = 'user-ratings-container';
        container.id = 'user-ratings-ui';

        // Get item name for personalized heading
        let itemName = 'this item';
        try {
            console.log('[UserRatings] → Loading item details...');
            const itemDetails = await ApiClient.getItem(ApiClient.getCurrentUserId(), itemId);
            if (itemDetails && itemDetails.Name) {
                itemName = itemDetails.Name;
            }
        } catch (error) {
            console.log('[UserRatings] Could not load item name:', error);
        }

        // Header
        const header = document.createElement('div');
        header.className = 'user-ratings-header';
        header.innerHTML = '<span>User Ratings</span>';

        const avgSpan = document.createElement('span');
        avgSpan.className = 'user-ratings-average';
        avgSpan.id = 'ratings-average-display';
        header.appendChild(avgSpan);
        container.appendChild(header);

        // My Rating Section
        const myRatingSection = document.createElement('div');
        myRatingSection.className = 'user-ratings-my-rating';

        // Star Rating Section
        const starSection = document.createElement('div');
        starSection.className = 'rating-form-section';

        const myRatingTitle = document.createElement('div');
        myRatingTitle.className = 'user-ratings-section-title';
        myRatingTitle.textContent = `How would you rate ${itemName}?`;
        starSection.appendChild(myRatingTitle);

        const starRatingContainer = document.createElement('div');
        starRatingContainer.className = 'star-rating-container';

        const starContainer = this.createStarRating(0, true,
            (rating) => {
                this.updateStarDisplay(starContainer, rating);
                ratingPrompt.style.display = rating === 0 ? 'inline' : 'none';
            },
            (rating) => {
                this.currentRating = rating;
                this.updateStarDisplay(starContainer, rating);
                ratingPrompt.style.display = 'none';
            }
        );
        starRatingContainer.appendChild(starContainer);

        const ratingPrompt = document.createElement('span');
        ratingPrompt.className = 'rating-prompt';
        ratingPrompt.textContent = 'Select your rating';
        starRatingContainer.appendChild(ratingPrompt);

        starSection.appendChild(starRatingContainer);
        myRatingSection.appendChild(starSection);

        // Review Text Section
        const reviewSection = document.createElement('div');
        reviewSection.className = 'rating-form-section';

        const reviewTitle = document.createElement('div');
        reviewTitle.className = 'user-ratings-section-title';
        reviewTitle.textContent = 'Tell us about your experience';
        reviewSection.appendChild(reviewTitle);

        const reviewSubtitle = document.createElement('div');
        reviewSubtitle.className = 'user-ratings-section-subtitle';
        reviewSubtitle.textContent = 'Share your thoughts (optional)';
        reviewSection.appendChild(reviewSubtitle);

        const noteInput = document.createElement('textarea');
        noteInput.className = 'rating-note-input';
        noteInput.placeholder = 'Start your review...';
        reviewSection.appendChild(noteInput);

        const charCount = document.createElement('div');
        charCount.className = 'rating-char-count';
        charCount.textContent = '0 characters';
        reviewSection.appendChild(charCount);

        // Character counter
        noteInput.addEventListener('input', () => {
            const length = noteInput.value.length;
            charCount.textContent = `${length} character${length !== 1 ? 's' : ''}`;
        });

        myRatingSection.appendChild(reviewSection);

        // Actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'rating-actions';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Post Rating';
        saveBtn.addEventListener('click', async () => {
            if (this.currentRating === 0) {
                alert('Please select a rating');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Posting...';

            const result = await RatingsAPI.saveRating(itemId, this.currentRating, noteInput.value);

            if (result.success) {
                saveBtn.textContent = 'Posted!';
                setTimeout(() => {
                    saveBtn.textContent = 'Post Rating';
                    saveBtn.disabled = false;
                }, 2000);

                await this.displayAllRatings(itemId, container);
                deleteBtn.style.display = 'inline-block';
            } else {
                alert('Error saving rating: ' + result.message);
                saveBtn.textContent = 'Post Rating';
                saveBtn.disabled = false;
            }
        });
        actionsContainer.appendChild(saveBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete Rating';
        deleteBtn.style.display = 'none';
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete your rating?')) {
                return;
            }

            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Deleting...';

            const result = await RatingsAPI.deleteRating(itemId);

            if (result.success) {
                this.currentRating = 0;
                noteInput.value = '';
                this.updateStarDisplay(starContainer, 0);
                deleteBtn.style.display = 'none';

                await this.displayAllRatings(itemId, container);
            } else {
                alert('Error deleting rating: ' + result.message);
            }

            deleteBtn.textContent = 'Delete Rating';
            deleteBtn.disabled = false;
        });
        actionsContainer.appendChild(deleteBtn);

        myRatingSection.appendChild(actionsContainer);
        container.appendChild(myRatingSection);

        // All Ratings Section
        const allRatingsSection = document.createElement('div');
        allRatingsSection.className = 'user-ratings-all';
        allRatingsSection.id = 'all-ratings-section';
        container.appendChild(allRatingsSection);

        // Load existing rating
        console.log('[UserRatings] → Loading my rating...');
        const myRating = await RatingsAPI.loadMyRating(itemId);
        if (myRating && myRating.rating) {
            this.currentRating = myRating.rating;
            this.updateStarDisplay(starContainer, myRating.rating);
            ratingPrompt.style.display = 'none';
            noteInput.value = myRating.note || '';
            const length = noteInput.value.length;
            charCount.textContent = `${length} character${length !== 1 ? 's' : ''}`;
            deleteBtn.style.display = 'inline-block';
        }

        // Load all ratings
        console.log('[UserRatings] → Loading all ratings...');
        await this.displayAllRatings(itemId, container);
        console.log('[UserRatings] → All ratings loaded, returning container');

        return container;
    },

    /**
     * Display all ratings for an item
     */
    async displayAllRatings(itemId, container) {
        console.log('[UserRatings] → displayAllRatings started');
        const allRatingsSection = container.querySelector('#all-ratings-section');
        const avgDisplay = container.querySelector('#ratings-average-display');

        if (!allRatingsSection) {
            console.log('[UserRatings] → No allRatingsSection found');
            return;
        }

        allRatingsSection.innerHTML = '';

        const data = await RatingsAPI.loadRatings(itemId);
        const ratings = data.ratings || [];
        const averageRating = data.averageRating || 0;
        const totalRatings = data.totalRatings || 0;

        // Update average display
        if (totalRatings > 0) {
            avgDisplay.textContent = `★ ${averageRating.toFixed(1)} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`;
        } else {
            avgDisplay.textContent = 'No ratings yet';
        }

        if (ratings.length === 0) {
            return;
        }

        const title = document.createElement('div');
        title.className = 'user-ratings-section-title';
        title.textContent = 'All Ratings';
        allRatingsSection.appendChild(title);

        ratings.forEach(rating => {
            const item = document.createElement('div');
            item.className = 'rating-item';

            const header = document.createElement('div');
            header.className = 'rating-item-header';

            const leftSide = document.createElement('div');
            const userName = document.createElement('span');
            userName.className = 'rating-item-user';
            userName.textContent = rating.userName || rating.UserName || 'Unknown User';
            leftSide.appendChild(userName);

            const stars = document.createElement('span');
            stars.className = 'rating-item-stars';
            const ratingValue = rating.rating || rating.Rating || 0;
            stars.textContent = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
            leftSide.appendChild(stars);

            header.appendChild(leftSide);

            const timestamp = rating.timestamp || rating.Timestamp;
            if (timestamp) {
                const date = document.createElement('span');
                date.className = 'rating-item-date';
                const dateObj = new Date(timestamp);
                date.textContent = dateObj.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                header.appendChild(date);
            }

            item.appendChild(header);

            const noteText = rating.note || rating.Note;
            if (noteText) {
                const note = document.createElement('div');
                note.className = 'rating-item-note';
                note.textContent = noteText;
                item.appendChild(note);
            }

            allRatingsSection.appendChild(item);
        });

        console.log('[UserRatings] → displayAllRatings completed');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RatingsUI;
}

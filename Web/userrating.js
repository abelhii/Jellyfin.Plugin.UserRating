(function () {
  'use strict';

  console.log('[UserRatings] Loading plugin...');

  // CSS for inline ratings UI
  const style = document.createElement('style');
  style.textContent = `
        .user-ratings-container {
            background: rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 1.8em 2em;
            margin-top: 2em;
            margin-bottom: 2em;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-sizing: border-box;
            order: 4;
            grid-column: 1/-1;
        }
        .user-ratings-container * {
            box-sizing: border-box;
        }
        .user-ratings-header {
            font-size: 1.3em;
            font-weight: 500;
            margin-bottom: 1.2em;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 1em;
            flex-wrap: wrap;
        }
        .user-ratings-average {
            color: #ffd700;
            font-size: 1.1em;
        }
        .user-ratings-my-rating {
            margin-bottom: 1.5em;
            padding-bottom: 1.5em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .user-ratings-section-title {
            font-size: 1.15em;
            margin-bottom: 0.3em;
            color: #ffffff;
            font-weight: 600;
        }
        .user-ratings-section-subtitle {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 0.8em;
        }
        .rating-form-row {
            display: block;
            margin-top: 0.5em;
        }
        .rating-form-section {
            margin-bottom: 1.6em;
        }
        .star-rating-container {
            display: flex;
            align-items: center;
            gap: 0.8em;
            margin-bottom: 0.5em;
        }
        .star-rating {
            display: inline-flex;
            gap: 0.25em;
            cursor: pointer;
            font-size: 1.9em;
        }
        .star-rating .star {
            color: rgba(255, 255, 255, 0.15);
            transition: color 0.2s, transform 0.15s;
            cursor: pointer;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }
        .star-rating .star.filled {
            color: #ffd700;
        }
        .star-rating .star:hover {
            color: #ffed4e;
            transform: scale(1.15);
        }
        .rating-prompt {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9em;
        }
        .rating-note-input {
            width: 100%;
            padding: 1em;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 0.95em;
            font-family: inherit;
            transition: border-color 0.2s, background 0.2s;
            resize: vertical;
            min-height: 100px;
            line-height: 1.6;
        }
        .rating-note-input:focus {
            outline: none;
            border-color: #00a4dc;
            background: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 1px #00a4dc;
        }
        .rating-note-input::placeholder {
            color: rgba(255, 255, 255, 0.35);
        }
        .rating-char-count {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 0.5em;
        }
        .rating-char-count.error {
            color: #ff6b6b;
        }
        .rating-actions {
            margin-top: 1.2em;
            display: flex;
            gap: 0.75em;
            flex-wrap: wrap;
        }
        .rating-actions button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            outline: 0;
            margin: 0;
            cursor: pointer;
            user-select: none;
            vertical-align: middle;
            text-decoration: none;
            font-family: inherit;
            font-weight: 500;
            font-size: 0.9375rem;
            line-height: 1.75;
            letter-spacing: 0.02857em;
            text-transform: uppercase;
            min-width: 64px;
            padding: 8px 22px;
            border-radius: 4px;
            transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            border: 0;
        }
        .rating-actions .save-btn {
            background-color: #e53935;
            color: #fff;
            box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
            flex: 1;
            min-width: 200px;
        }
        .rating-actions .save-btn:hover:not(:disabled) {
            background-color: #d32f2f;
            box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
        }
        .rating-actions .save-btn:active:not(:disabled) {
            box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
        }
        .rating-actions .save-btn:disabled {
            background-color: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.3);
            cursor: default;
            pointer-events: none;
            box-shadow: none;
        }
        .rating-actions .delete-btn {
            background-color: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.23);
            padding: 7px 21px;
        }
        .rating-actions .delete-btn:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.23);
        }
        .rating-actions .delete-btn:active {
            background-color: rgba(255, 255, 255, 0.12);
        }
        .user-ratings-all {
            margin-top: 1.5em;
        }
        .rating-item {
            margin: 0.75em 0;
            padding: 1em;
            background: rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rating-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5em;
            flex-wrap: wrap;
            gap: 0.5em;
        }
        .rating-item-user {
            font-weight: 500;
            color: #ffffff;
        }
        .rating-item-stars {
            color: #ffd700;
            margin-left: 0.5em;
        }
        .rating-item-date {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.5);
        }
        .rating-item-note {
            margin-top: 0.5em;
            opacity: 0.9;
            font-size: 0.95em;
            color: #e0e0e0;
            line-height: 1.4;
        }
    `;
  document.head.appendChild(style);

  let currentItemId = null;
  let currentRating = 0;
  let isInjecting = false;

  function createStarRating(rating, interactive, onHover, onClick) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:inline-flex;align-items:center;gap:0.5em;';

    const container = document.createElement('div');
    container.className = 'star-rating';
    let currentSelectedRating = rating;

    const label = document.createElement('span');
    label.style.cssText = 'font-size:1em;color:rgba(255,255,255,0.7);min-width:3.5em;font-variant-numeric:tabular-nums;';
    label.textContent = rating > 0 ? `${rating}/10` : '';

    for (let i = 1; i <= 10; i++) {
      const star = document.createElement('span');
      star.className = 'star' + (i <= rating ? ' filled' : '');
      star.textContent = '★';
      star.dataset.rating = i;

      if (interactive) {
        star.addEventListener('mouseenter', () => {
          label.textContent = `${i}/10`;
          onHover(i);
        });
        star.addEventListener('click', () => {
          currentSelectedRating = i;
          label.textContent = `${i}/10`;
          onClick(i);
        });
      }

      container.appendChild(star);
    }

    if (interactive) {
      container.addEventListener('mouseleave', () => {
        label.textContent = currentSelectedRating > 0 ? `${currentSelectedRating}/10` : '';
        onHover(currentSelectedRating);
      });
    }

    wrapper.appendChild(container);
    wrapper.appendChild(label);
    return wrapper;
  }

  function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }

  async function loadRatings(itemId) {
    try {
      const response = await fetch(ApiClient.getUrl(`api/UserRatings/Item/${itemId}`), {
        headers: { 'X-Emby-Token': ApiClient.accessToken() }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[UserRatings] Error loading ratings:', error);
      return { ratings: [], averageRating: 0, totalRatings: 0 };
    }
  }

  async function loadMyRating(itemId) {
    try {
      const userId = ApiClient.getCurrentUserId();
      const response = await fetch(ApiClient.getUrl(`api/UserRatings/MyRating/${itemId}?userId=${userId}`), {
        headers: { 'X-Emby-Token': ApiClient.accessToken() }
      });
      return await response.json();
    } catch (error) {
      console.error('[UserRatings] Error loading my rating:', error);
      return null;
    }
  }

  async function saveRating(itemId, rating, note) {
    try {
      const userId = ApiClient.getCurrentUserId();
      const user = await ApiClient.getCurrentUser();
      const userName = user ? user.Name : 'Unknown';
      const url = ApiClient.getUrl(`api/UserRatings/Rate?itemId=${itemId}&userId=${userId}&rating=${rating}${note ? '&note=' + encodeURIComponent(note) : ''}&userName=${encodeURIComponent(userName)}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'X-Emby-Token': ApiClient.accessToken() }
      });
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Server error: ${response.status}` };
      }
      return await response.json();
    } catch (error) {
      console.error('[UserRatings] Error saving rating:', error);
      return { success: false, message: error.message };
    }
  }

  async function deleteRating(itemId) {
    try {
      const userId = ApiClient.getCurrentUserId();
      const url = ApiClient.getUrl(`api/UserRatings/Rating?itemId=${itemId}&userId=${userId}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'X-Emby-Token': ApiClient.accessToken() }
      });
      return await response.json();
    } catch (error) {
      console.error('[UserRatings] Error deleting rating:', error);
      return { success: false, message: error.message };
    }
  }

  async function createRatingsUI(itemId) {
    const container = document.createElement('div');
    container.className = 'user-ratings-container';
    container.id = 'user-ratings-ui';

    let itemName = 'this item';
    try {
      const itemDetails = await ApiClient.getItem(ApiClient.getCurrentUserId(), itemId);
      if (itemDetails && itemDetails.Name) itemName = itemDetails.Name;
    } catch (error) {
      console.log('[UserRatings] Could not load item name:', error);
    }

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

    const starContainer = createStarRating(0, true,
      (rating) => {
        updateStarDisplay(starContainer, rating);
        ratingPrompt.style.display = rating === 0 ? 'inline' : 'none';
      },
      (rating) => {
        currentRating = rating;
        updateStarDisplay(starContainer, rating);
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
      if (currentRating === 0) { alert('Please select a rating'); return; }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Posting...';
      const result = await saveRating(itemId, currentRating, noteInput.value);
      if (result.success) {
        saveBtn.textContent = 'Posted!';
        setTimeout(() => { saveBtn.textContent = 'Post Rating'; saveBtn.disabled = false; }, 2000);
        await displayAllRatings(itemId, container);
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
      if (!confirm('Delete your rating?')) return;
      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Deleting...';
      const result = await deleteRating(itemId);
      if (result.success) {
        currentRating = 0;
        noteInput.value = '';
        updateStarDisplay(starContainer, 0);
        deleteBtn.style.display = 'none';
        await displayAllRatings(itemId, container);
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
    const myRating = await loadMyRating(itemId);
    if (myRating && myRating.rating) {
      currentRating = myRating.rating;
      updateStarDisplay(starContainer, myRating.rating);
      ratingPrompt.style.display = 'none';
      noteInput.value = myRating.note || '';
      const length = noteInput.value.length;
      charCount.textContent = `${length} character${length !== 1 ? 's' : ''}`;
      deleteBtn.style.display = 'inline-block';
    }

    await displayAllRatings(itemId, container);
    return container;
  }

  async function displayAllRatings(itemId, container) {
    const allRatingsSection = container.querySelector('#all-ratings-section');
    const avgDisplay = container.querySelector('#ratings-average-display');
    if (!allRatingsSection) return;

    allRatingsSection.innerHTML = '';
    const data = await loadRatings(itemId);
    const ratings = data.ratings || [];
    const averageRating = data.averageRating || 0;
    const totalRatings = data.totalRatings || 0;

    if (totalRatings > 0) {
      avgDisplay.textContent = `★ ${averageRating.toFixed(1)} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`;
    } else {
      avgDisplay.textContent = 'No ratings yet';
    }

    if (ratings.length === 0) return;

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
      stars.textContent = '★'.repeat(ratingValue) + '☆'.repeat(10 - ratingValue);
      leftSide.appendChild(stars);
      header.appendChild(leftSide);

      const timestamp = rating.timestamp || rating.Timestamp;
      if (timestamp) {
        const date = document.createElement('span');
        date.className = 'rating-item-date';
        date.textContent = new Date(timestamp).toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
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
  }

  let injectionAttempts = 0;
  const maxInjectionAttempts = 20;

  function injectRatingsUI() {
    if (isInjecting) return;

    let itemId = null;
    const urlParams = new URLSearchParams(window.location.search);
    itemId = urlParams.get('id');

    if (!itemId && window.location.hash.includes('?')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      itemId = hashParams.get('id');
    }

    if (!itemId) {
      const guidMatch = window.location.href.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (guidMatch) itemId = guidMatch[1];
    }

    if (!itemId) {
      injectionAttempts = 0;
      return;
    }

    const existingUI = document.getElementById('user-ratings-ui');
    if (existingUI && currentItemId === itemId) {
      injectionAttempts = 0;
      return;
    }
    if (existingUI && currentItemId !== itemId) {
      existingUI.remove();
    }

    let targetContainer = null;
    targetContainer = document.querySelector('.detailPagePrimaryContent .detailSection');
    if (!targetContainer) {
      const primaryContent = document.querySelector('.detailPagePrimaryContent');
      if (primaryContent && primaryContent.children.length > 0) targetContainer = primaryContent;
    }
    if (!targetContainer) targetContainer = document.querySelector('.detailSection');
    if (!targetContainer) {
      const detailPage = document.querySelector('.itemDetailPage .detailPageContent');
      if (detailPage) targetContainer = detailPage;
    }

    if (!targetContainer) {
      if (injectionAttempts < maxInjectionAttempts) {
        injectionAttempts++;
        const retryDelay = Math.min(100 * Math.pow(1.5, injectionAttempts), 3000);
        setTimeout(injectRatingsUI, retryDelay);
      } else {
        // Give up cleanly — no refresh
        console.log('[UserRatings] Max injection attempts reached, giving up');
        injectionAttempts = 0;
        isInjecting = false;
      }
      return;
    }

    currentItemId = itemId;
    isInjecting = true;
    injectionAttempts = 0;

    createRatingsUI(itemId).then(ui => {
      targetContainer.appendChild(ui);
      isInjecting = false;
      console.log('[UserRatings] ✓ UI injected successfully');
    }).catch(err => {
      console.error('[UserRatings] Error creating UI:', err);
      isInjecting = false;
      injectionAttempts = 0;
    });
  }

  // Watch for navigation and DOM changes
  let lastUrl = location.href;
  new MutationObserver((mutations) => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;

      const oldUI = document.getElementById('user-ratings-ui');
      if (oldUI) oldUI.remove();

      const ratingsTabContent = document.querySelector('#ratingsTab');
      if (ratingsTabContent) {
        ratingsTabContent.style.display = 'none';
        ratingsTabContent.classList.add('hide');
      }

      isInjecting = false;
      injectionAttempts = 0;
      currentItemId = null;

      setTimeout(injectRatingsUI, 150);
      return;
    }

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          if (node.classList && (
            node.classList.contains('detailPagePrimaryContent') ||
            node.classList.contains('detailSection') ||
            node.classList.contains('itemDetailPage')
          )) {
            isInjecting = false;
            injectionAttempts = 0;
            setTimeout(injectRatingsUI, 100);
            return;
          }
          if (node.querySelector && (
            node.querySelector('.detailPagePrimaryContent') ||
            node.querySelector('.detailSection') ||
            node.querySelector('.itemDetailPage')
          )) {
            isInjecting = false;
            injectionAttempts = 0;
            setTimeout(injectRatingsUI, 100);
            return;
          }
        }
      }
    }
  }).observe(document.body, { subtree: true, childList: true });

  window.addEventListener('hashchange', () => {
    const oldUI = document.getElementById('user-ratings-ui');
    if (oldUI) oldUI.remove();

    const ratingsTab = document.querySelector('#ratingsTab');
    const currentHash = window.location.hash;
    if (ratingsTab) {
      if (!currentHash.includes('home')) {
        ratingsTab.style.display = 'none';
        ratingsTab.classList.add('hide');
      } else {
        ratingsTab.style.display = 'none';
        ratingsTab.classList.add('hide');

        const homePage = document.querySelector('[data-role="page"].homePage:not(#ratingsTab)');
        if (homePage) {
          homePage.classList.remove('hide');
          homePage.style.display = '';
        }
      }
    }

    isInjecting = false;
    injectionAttempts = 0;
    currentItemId = null; 865
    setTimeout(injectRatingsUI, 100);
    setTimeout(injectRatingsUI, 300);
  });

  // Initial injection attempts
  setTimeout(injectRatingsUI, 100);
  setTimeout(injectRatingsUI, 300);
  setTimeout(injectRatingsUI, 600);

  // Home tab injection (unchanged)
  function injectRatingsTab() {
    try {
      if (!window.location.hash.includes('home')) return;
      if (document.querySelector('[data-ratings-tab="true"]')) return;

      const homeButton = Array.from(document.querySelectorAll('.emby-tab-button')).find(btn =>
        btn.textContent.trim().toLowerCase().includes('home')
      );
      const tabsSlider = homeButton ? homeButton.parentElement : document.querySelector('.emby-tabs-slider');
      if (!tabsSlider) return;

      const nextIndex = tabsSlider.querySelectorAll('.emby-tab-button').length;
      const ratingsTab = document.createElement('button');
      ratingsTab.type = 'button';
      ratingsTab.setAttribute('is', 'emby-button');
      ratingsTab.className = 'emby-tab-button emby-button';
      ratingsTab.setAttribute('data-index', nextIndex);
      ratingsTab.setAttribute('data-ratings-tab', 'true');
      ratingsTab.innerHTML = '<div class="emby-button-foreground">User Ratings</div>';

      ratingsTab.addEventListener('click', async function (e) {
        e.preventDefault();

        // deactivate buttons
        tabsSlider.querySelectorAll('.emby-tab-button')
          .forEach(tab => tab.classList.remove('emby-tab-button-active'));

        ratingsTab.classList.add('emby-tab-button-active');

        // deactivate all tab content
        document.querySelectorAll('#indexPage .tabContent')
          .forEach(tab => tab.classList.remove('is-active'));

        // activate ratings tab
        ratingsTabContent.classList.add('is-active');
        ratingsTabContent.classList.remove('hide');

        await displayRatingsList();
      });

      tabsSlider.querySelectorAll('.emby-tab-button:not([data-ratings-tab="true"])')
        .forEach(tab => {
          tab.addEventListener('click', function () {
            if (ratingsTabContent) {
              ratingsTabContent.classList.remove('is-active');
              ratingsTabContent.classList.add('hide');
            }
          }, true);
        });

      tabsSlider.appendChild(ratingsTab);
    } catch (error) {
      console.error('[UserRatings] Tab injection error:', error);
    }
  }

  async function displayRatingsList() {
    const indexPage = document.querySelector('#indexPage');
    if (!indexPage) {
      console.error('[UserRatings] #indexPage not found');
      return;
    }

    let ratingsTabContent = document.querySelector('#ratingsTab');

    if (!ratingsTabContent) {
      ratingsTabContent = document.createElement('div');
      ratingsTabContent.id = 'ratingsTab';

      // ✅ MATCH Jellyfin tabs
      const nextIndex = tabsSlider.querySelectorAll('.emby-tab-button').length;
      ratingsTabContent.className = 'tabContent pageTabContent hide';
      ratingsTabContent.setAttribute('data-index', nextIndex || 2); // next tab index
      ratingsTabContent.setAttribute('role', 'tabpanel');

      indexPage.appendChild(ratingsTabContent);
    }

    ratingsTabContent.classList.remove('hide');
    ratingsTabContent.style.display = 'block';
    ratingsTabContent.style.pointerEvents = 'auto';
    ratingsTabContent.innerHTML = '<div style="padding: 3em 2em; text-align: center; color: rgba(255,255,255,0.6);">Loading ratings...</div>';

    try {
      const ratingsResponse = await fetch(ApiClient.getUrl('api/UserRatings/AllRatedItems'), {
        headers: { 'X-Emby-Token': ApiClient.accessToken() }
      });
      if (!ratingsResponse.ok) throw new Error('Failed to load ratings');
      const ratingsData = await ratingsResponse.json();
      const items = ratingsData.items || [];

      if (items.length === 0) {
        ratingsTabContent.innerHTML = `<div style="padding:4em 2em;text-align:center;"><div style="font-size:4em;margin-bottom:0.5em;opacity:0.3;">★</div><div style="font-size:1.2em;color:rgba(255,255,255,0.6);">No rated items yet</div></div>`;
        return;
      }

      const itemsWithDetails = (await Promise.all(items.map(async item => {
        try {
          const details = await ApiClient.getItem(ApiClient.getCurrentUserId(), item.itemId);
          return { ...item, details };
        } catch { return null; }
      }))).filter(Boolean);

      if (itemsWithDetails.length === 0) {
        ratingsTabContent.innerHTML = `<div style="padding:4em 2em;text-align:center;"><div style="font-size:1.2em;color:rgba(255,255,255,0.6);">Could not load item details</div></div>`;
        return;
      }

      itemsWithDetails.forEach(item => {
        const ratingInfo = ratingsData.items.find(r => r.itemId === item.itemId);
        item.lastRatedTimestamp = ratingInfo?.lastRated || 0;
      });

      let recentItemsLimit = 10;
      try {
        const pluginConfig = await ApiClient.getPluginConfiguration('b8c5d3e7-4f6a-8b9c-1d2e-3f4a5b6c7d8e');
        recentItemsLimit = pluginConfig.RecentlyRatedItemsCount || 10;
      } catch { }

      const sortByRecent = (a, b) => (b.lastRatedTimestamp || 0) - (a.lastRatedTimestamp || 0);
      const movies = itemsWithDetails.filter(i => i.details.Type === 'Movie').sort(sortByRecent).slice(0, recentItemsLimit);
      const series = itemsWithDetails.filter(i => i.details.Type === 'Series').sort(sortByRecent).slice(0, recentItemsLimit);
      const episodes = itemsWithDetails.filter(i => i.details.Type === 'Episode').sort(sortByRecent).slice(0, recentItemsLimit);

      const buildCategoryGrid = (items) => items.map(item => {
        const details = item.details;
        const imageId = details.Type === 'Episode' && details.SeriesId ? details.SeriesId : item.itemId;
        const imageUrl = ApiClient.getImageUrl(imageId, { type: 'Primary', maxHeight: 400, quality: 90 });
        const title = details.Name || 'Unknown';
        const rating = item.averageRating.toFixed(1);
        const count = item.totalRatings;
        const serverId = ApiClient.serverId();
        return `
                    <div data-index="0" data-isfolder="false" data-serverid="${serverId}" data-id="${item.itemId}" data-type="${details.Type}" data-mediatype="Video" class="card portraitCard card-hoverable card-withuserdata" style="min-width:150px;max-width:250px;">
                        <div class="cardBox cardBox-bottompadded">
                            <div class="cardScalable">
                                <div class="cardPadder cardPadder-portrait"></div>
                                <a href="#/details?id=${item.itemId}&serverId=${serverId}" data-action="link" class="cardImageContainer coveredImage cardContent itemAction lazy blurhashed lazy-image-fadein-fast" aria-label="${title}" style="background-image:url('${imageUrl}');"></a>
                                <div class="cardIndicators cardIndicators-bottomright">
                                    <div style="background:rgba(0,0,0,0.85);padding:0.4em 0.7em;border-radius:4px;display:inline-flex;align-items:center;gap:0.3em;">
                                        <span style="color:#ffd700;font-size:1.1em;">★</span>
                                        <span style="font-weight:600;">${rating}</span>
                                        <span style="opacity:0.7;font-size:0.85em;">(${count})</span>
                                    </div>
                                </div>
                            </div>
                            <div class="cardText cardTextCentered cardText-first"><bdi><a href="#/details?id=${item.itemId}&serverId=${serverId}" data-id="${item.itemId}" data-serverid="${serverId}" data-type="${details.Type}" data-action="link" class="itemAction textActionButton" title="${title}">${title}</a></bdi></div>
                            <div class="cardText cardTextCentered">&nbsp;</div>
                        </div>
                    </div>`;
      }).join('');

      const buildSection = (title, items) => items.length === 0 ? '' : `
                <div class="verticalSection">
                    <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                        <h2 class="sectionTitle sectionTitle-cards">${title}</h2>
                    </div>
                    <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x" data-margin="0.9%">
                        ${buildCategoryGrid(items)}
                    </div>
                </div>`;

      let sectionsHTML = `<div style="padding-top:4em;">
                ${buildSection('Recently Rated Movies', movies)}
                ${buildSection('Recently Rated Shows', series)}
                ${buildSection('Recently Rated Episodes', episodes)}
                <div id="allItemsSection"></div>
            </div>`;

      ratingsTabContent.innerHTML = sectionsHTML;
      ratingsTabContent.style.pointerEvents = 'auto';

      let currentPage = 1;
      const itemsPerPage = 24;
      let currentSort = 'rating-desc';
      let allItems = [...itemsWithDetails];

      const renderAllItemsSection = (page, sortBy) => {
        switch (sortBy) {
          case 'rating-desc': allItems.sort((a, b) => b.averageRating - a.averageRating); break;
          case 'rating-asc': allItems.sort((a, b) => a.averageRating - b.averageRating); break;
          case 'recent': allItems.sort((a, b) => (b.lastRatedTimestamp || 0) - (a.lastRatedTimestamp || 0)); break;
          case 'oldest': allItems.sort((a, b) => (a.lastRatedTimestamp || 0) - (b.lastRatedTimestamp || 0)); break;
          case 'title-asc': allItems.sort((a, b) => (a.details.Name || '').localeCompare(b.details.Name || '')); break;
          case 'title-desc': allItems.sort((a, b) => (b.details.Name || '').localeCompare(a.details.Name || '')); break;
          case 'count-desc': allItems.sort((a, b) => b.totalRatings - a.totalRatings); break;
          case 'count-asc': allItems.sort((a, b) => a.totalRatings - b.totalRatings); break;
        }
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedItems = allItems.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(allItems.length / itemsPerPage);
        const startItem = startIndex + 1;
        const endItem = Math.min(startIndex + itemsPerPage, allItems.length);

        const allItemsSection = document.querySelector('#allItemsSection');
        if (!allItemsSection) return;
        allItemsSection.innerHTML = `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">All Rated Items</h2>
                        </div>
                        <div class="flex align-items-center justify-content-center flex-wrap-wrap padded-top padded-left padded-right padded-bottom focuscontainer-x" style="gap:1em;">
                            <div class="paging"><div class="listPaging">
                                <span style="vertical-align:middle;">${startItem}-${endItem} of ${allItems.length}</span>
                                <div style="display:inline-block;">
                                    <button is="paper-icon-button-light" id="prevPage" class="btnPreviousPage autoSize paper-icon-button-light" ${page === 1 ? 'disabled' : ''}><span class="material-icons arrow_back" aria-hidden="true"></span></button>
                                    <button is="paper-icon-button-light" id="nextPage" class="btnNextPage autoSize paper-icon-button-light" ${page === totalPages ? 'disabled' : ''}><span class="material-icons arrow_forward" aria-hidden="true"></span></button>
                                </div>
                            </div></div>
                            <select is="emby-select" id="sortSelect" class="emby-select-withcolor emby-select" style="width:auto;">
                                <option value="rating-desc" ${sortBy === 'rating-desc' ? 'selected' : ''}>Rating: High to Low</option>
                                <option value="rating-asc"  ${sortBy === 'rating-asc' ? 'selected' : ''}>Rating: Low to High</option>
                                <option value="title-asc"   ${sortBy === 'title-asc' ? 'selected' : ''}>Title: A-Z</option>
                                <option value="title-desc"  ${sortBy === 'title-desc' ? 'selected' : ''}>Title: Z-A</option>
                                <option value="recent"      ${sortBy === 'recent' ? 'selected' : ''}>Recently Rated</option>
                                <option value="oldest"      ${sortBy === 'oldest' ? 'selected' : ''}>Oldest Rated</option>
                                <option value="count-desc"  ${sortBy === 'count-desc' ? 'selected' : ''}>Most Ratings</option>
                                <option value="count-asc"   ${sortBy === 'count-asc' ? 'selected' : ''}>Least Ratings</option>
                            </select>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">
                            ${buildCategoryGrid(paginatedItems)}
                        </div>
                    </div>`;

        document.querySelector('#sortSelect')?.addEventListener('change', e => {
          currentSort = e.target.value; currentPage = 1; renderAllItemsSection(currentPage, currentSort);
        });
        const prevBtn = document.querySelector('#prevPage');
        if (prevBtn && !prevBtn.disabled) prevBtn.addEventListener('click', () => { currentPage--; renderAllItemsSection(currentPage, currentSort); allItemsSection.scrollIntoView({ behavior: 'smooth' }); });
        const nextBtn = document.querySelector('#nextPage');
        if (nextBtn && !nextBtn.disabled) nextBtn.addEventListener('click', () => { currentPage++; renderAllItemsSection(currentPage, currentSort); allItemsSection.scrollIntoView({ behavior: 'smooth' }); });
      };

      renderAllItemsSection(currentPage, currentSort);

    } catch (error) {
      console.error('[UserRatings] Error displaying ratings list:', error);
      ratingsTabContent.innerHTML = `<div style="padding:2em;background:rgba(229,57,53,0.2);border:1px solid rgba(229,57,53,0.5);border-radius:8px;color:#ff6b6b;margin:2em;"><strong>Error:</strong> ${error.message}</div>`;
    }
  }

  injectRatingsTab();
  setTimeout(injectRatingsTab, 100);
  setTimeout(injectRatingsTab, 500);
  setTimeout(injectRatingsTab, 1000);
  setTimeout(injectRatingsTab, 2000);
  setTimeout(injectRatingsTab, 3000);
  setInterval(injectRatingsTab, 2000);

  window.addEventListener('hashchange', () => {
    setTimeout(injectRatingsTab, 100);
    setTimeout(injectRatingsTab, 500);
  });

  new MutationObserver(() => {
    injectRatingsTab();
  }).observe(document.body, { subtree: true, childList: true });

})();
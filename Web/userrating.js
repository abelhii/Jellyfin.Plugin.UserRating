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

  // =========================================================================
  // Centralized debounce timers
  // =========================================================================
  let detailInjectionTimer = null;
  let tabInjectionTimer = null;

  function scheduleDetailInjection(delay = 150) {
    clearTimeout(detailInjectionTimer);
    detailInjectionTimer = setTimeout(() => {
      injectRatingsUI();
    }, delay);
  }

  function scheduleTabInjection(delay = 200) {
    clearTimeout(tabInjectionTimer);
    tabInjectionTimer = setTimeout(() => {
      injectRatingsTab();
    }, delay);
  }

  // =========================================================================
  // Concurrency-limited fetch helper
  // =========================================================================
  async function fetchWithConcurrency(items, fetchFn, concurrency = 6) {
    const results = new Array(items.length);
    let index = 0;

    async function worker() {
      while (index < items.length) {
        const i = index++;
        try {
          results[i] = await fetchFn(items[i]);
        } catch {
          results[i] = null;
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
    );
    return results.filter(Boolean);
  }

  // =========================================================================
  // KEY FIX: Find the ACTIVE #indexPage (not the stale cached one).
  //
  // Jellyfin uses data-dom-cache="true" and keeps old page copies in the DOM
  // with class "hide". There can be TWO #indexPage divs simultaneously:
  //   - The stale one (has class "hide")
  //   - The active one (does NOT have class "hide")
  //
  // document.querySelector('#indexPage') always returns the FIRST one in DOM
  // order, which is typically the stale/hidden copy. We must find the active one.
  // =========================================================================
  function getActiveIndexPage() {
    const allIndexPages = document.querySelectorAll('#indexPage');
    for (const page of allIndexPages) {
      // The active page is the one WITHOUT the "hide" class
      if (!page.classList.contains('hide')) {
        return page;
      }
    }
    // Fallback: if none found without "hide", return the last one
    // (which is typically the most recently created)
    if (allIndexPages.length > 0) {
      return allIndexPages[allIndexPages.length - 1];
    }
    return null;
  }

  // =========================================================================
  // Get the correct tabs slider from the ACTIVE indexPage
  // =========================================================================
  function getActiveTabsSlider() {
    const indexPage = getActiveIndexPage();
    if (indexPage) {
      // Try to find the slider within this specific indexPage first
      const slider = indexPage.querySelector('.emby-tabs-slider');
      if (slider) return slider;
    }
    // Fallback: find a visible slider (not inside a hidden parent)
    const allSliders = document.querySelectorAll('.emby-tabs-slider');
    for (const slider of allSliders) {
      const parentPage = slider.closest('#indexPage');
      if (!parentPage || !parentPage.classList.contains('hide')) {
        return slider;
      }
    }
    return null;
  }

  // =========================================================================
  // Get the data-index for the ratings tab button
  // =========================================================================
  function getNextTabIndex(tabsSlider) {
    const allButtons = tabsSlider.querySelectorAll('.emby-tab-button');
    let maxIndex = -1;
    allButtons.forEach(btn => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
    });
    return maxIndex >= 0 ? maxIndex + 1 : allButtons.length;
  }

  // =========================================================================
  // Ensure the ratingsTab content panel exists inside the ACTIVE #indexPage,
  // following the same pattern as CustomTabs:
  //   <div class="tabContent pageTabContent" id="ratingsTab" data-index="N">
  // =========================================================================
  function ensureRatingsTabContent(indexPage, dataIndex) {
    // Check if this specific indexPage already has a ratingsTab
    let content = indexPage.querySelector('#ratingsTab');
    if (content) {
      content.setAttribute('data-index', dataIndex);
      return content;
    }

    content = document.createElement('div');
    content.className = 'tabContent pageTabContent';
    content.id = 'ratingsTab';
    content.setAttribute('data-index', dataIndex);
    content.style.display = 'none';

    // Insert after the last existing tabContent panel
    const lastTabContent = indexPage.querySelector('.pageTabContent:last-of-type');
    if (lastTabContent && lastTabContent.nextSibling) {
      indexPage.insertBefore(content, lastTabContent.nextSibling);
    } else {
      indexPage.appendChild(content);
    }

    console.log(`[UserRatings] ✓ Created ratingsTab inside active #indexPage with data-index=${dataIndex}`);
    return content;
  }

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

    const myRatingSection = document.createElement('div');
    myRatingSection.className = 'user-ratings-my-rating';

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

    noteInput.addEventListener('input', () => {
      const length = noteInput.value.length;
      charCount.textContent = `${length} character${length !== 1 ? 's' : ''}`;
    });

    myRatingSection.appendChild(reviewSection);

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

    const allRatingsSection = document.createElement('div');
    allRatingsSection.className = 'user-ratings-all';
    allRatingsSection.id = 'all-ratings-section';
    container.appendChild(allRatingsSection);

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

  // =========================================================================
  // Tab button injection
  // =========================================================================
  function injectRatingsTab() {
    try {
      if (!window.location.hash.includes('home')) return;

      // Find the ACTIVE tabs slider (not one inside a stale cached page)
      const tabsSlider = getActiveTabsSlider();
      if (!tabsSlider) return;

      // Check if THIS specific slider already has our tab button
      if (tabsSlider.querySelector('[data-ratings-tab="true"]')) return;

      // Find the ACTIVE indexPage to inject our content panel into
      const indexPage = getActiveIndexPage();
      if (!indexPage) {
        console.debug('[UserRatings] Active #indexPage not found yet');
        return;
      }

      const ratingsTabIndex = getNextTabIndex(tabsSlider);

      // Create content panel inside the ACTIVE #indexPage
      const ratingsTabContent = ensureRatingsTabContent(indexPage, ratingsTabIndex);
      if (!ratingsTabContent) return;

      // Create the tab button
      const ratingsTab = document.createElement('button');
      ratingsTab.type = 'button';
      ratingsTab.setAttribute('is', 'emby-button');
      ratingsTab.className = 'emby-tab-button emby-button';
      ratingsTab.setAttribute('data-index', ratingsTabIndex);
      ratingsTab.setAttribute('data-ratings-tab', 'true');
      ratingsTab.innerHTML = '<div class="emby-button-foreground">User Ratings</div>';

      ratingsTab.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Deactivate all tab buttons in this slider
        tabsSlider.querySelectorAll('.emby-tab-button').forEach(tab => {
          tab.classList.remove('emby-tab-button-active');
        });
        ratingsTab.classList.add('emby-tab-button-active');

        // Hide all tab content panels inside the SAME indexPage
        // (use the parent of our content panel to be safe)
        const parentPage = ratingsTabContent.parentElement;
        if (parentPage) {
          parentPage.querySelectorAll('.pageTabContent').forEach(panel => {
            panel.style.display = 'none';
            panel.classList.remove('is-active');
            panel.classList.add('hide');
          });
        }

        // Show our ratings tab content
        ratingsTabContent.classList.remove('hide');
        ratingsTabContent.classList.add('is-active');
        ratingsTabContent.style.display = '';

        try {
          await displayRatingsList(ratingsTabContent);
        } catch (error) {
          console.error('[UserRatings] Error in displayRatingsList:', error);
        }
      });

      // When any OTHER tab button in this slider is clicked, hide our content
      tabsSlider.querySelectorAll('.emby-tab-button:not([data-ratings-tab="true"])').forEach(tab => {
        tab.addEventListener('click', function () {
          ratingsTabContent.style.display = 'none';
          ratingsTabContent.classList.remove('is-active');
          ratingsTabContent.classList.add('hide');
        }, true);
      });

      tabsSlider.appendChild(ratingsTab);
      console.log(`[UserRatings] ✓ Ratings tab injected into active slider with data-index=${ratingsTabIndex}`);
    } catch (error) {
      console.error('[UserRatings] Tab injection error:', error);
    }
  }

  // =========================================================================
  // displayRatingsList
  // =========================================================================
  async function displayRatingsList(ratingsTabContent) {
    ratingsTabContent.innerHTML = '<div style="padding: 3em 2em; text-align: center; color: rgba(255,255,255,0.6);">Loading ratings...</div>';

    try {
      const ratingsResponse = await fetch(ApiClient.getUrl('api/UserRatings/AllRatedItems'), {
        headers: { 'X-Emby-Token': ApiClient.accessToken() }
      });
      if (!ratingsResponse.ok) throw new Error('Failed to load ratings');
      const ratingsData = await ratingsResponse.json();
      const items = ratingsData.items || [];

      if (items.length === 0) {
        ratingsTabContent.innerHTML = `<div style="padding:4em 2em;text-align:center;">
          <div style="font-size:4em;margin-bottom:0.5em;opacity:0.3;">★</div>
          <div style="font-size:1.2em;color:rgba(255,255,255,0.6);">No rated items yet</div>
        </div>`;
        return;
      }

      const itemsWithDetails = await fetchWithConcurrency(
        items,
        async (item) => {
          const details = await ApiClient.getItem(ApiClient.getCurrentUserId(), item.itemId);
          return { ...item, details };
        },
        6
      );

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
                    <div data-index="0" data-isfolder="false" data-serverid="${serverId}" data-id="${item.itemId}" data-type="${details.Type}" data-mediatype="Video" class="card portraitCard card-hoverable">
                        <div class="cardBox cardBox-bottompadded">
                            <div class="cardScalable">
                                <div class="cardPadder cardPadder-portrait"></div>
                                <canvas aria-hidden="true" width="20" height="20" class="blurhash-canvas lazy-hidden"></canvas>
                                <a href="#/details?id=${item.itemId}&serverId=${serverId}" data-action="link" class="cardImageContainer coveredImage cardContent itemAction lazy blurhashed lazy-image-fadein-fast" style="background-image:url('${imageUrl}');">
                                </a>
                                <div class="cardIndicators cardIndicators-bottomright">
                                    <div style="background:rgba(0,0,0,0.85);padding:0.4em 0.7em;border-radius:4px;display:inline-flex;align-items:center;gap:0.3em;">
                                        <span style="color:#ffd700;font-size:1.1em;">★</span>
                                        <span style="font-weight:600;">${rating}</span>
                                        <span style="opacity:0.7;font-size:0.85em;">(${count})</span>
                                    </div>
                                </div>
                            </div>
                            <div class="cardText cardTextCentered cardText-first"><bdi><a href="#/details?id=${item.itemId}&serverId=${serverId}" data-id="${item.itemId}" data-serverid="${serverId}" data-action="link" class="cardImageContainer itemAction">${title}</a></bdi></div>
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

      let sectionsHTML = `<div style="padding-top:1em;">
                ${buildSection('Recently Rated Movies', movies)}
                ${buildSection('Recently Rated Shows', series)}
                ${buildSection('Recently Rated Episodes', episodes)}
                <div id="allItemsSection"></div>
            </div>`;

      ratingsTabContent.innerHTML = sectionsHTML;

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

        const allItemsSection = ratingsTabContent.querySelector('#allItemsSection');
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
                                    <button is="paper-icon-button-light" id="prevPage" class="btnPreviousPage autoSize paper-icon-button-light" ${page === 1 ? 'disabled' : ''}><span class="material-icons chevron_left"></span></button>
                                    <button is="paper-icon-button-light" id="nextPage" class="btnNextPage autoSize paper-icon-button-light" ${page === totalPages ? 'disabled' : ''}><span class="material-icons chevron_right"></span></button>
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

        ratingsTabContent.querySelector('#sortSelect')?.addEventListener('change', e => {
          currentSort = e.target.value; currentPage = 1; renderAllItemsSection(currentPage, currentSort);
        });
        const prevBtn = ratingsTabContent.querySelector('#prevPage');
        if (prevBtn && !prevBtn.disabled) prevBtn.addEventListener('click', () => { currentPage--; renderAllItemsSection(currentPage, currentSort); allItemsSection.scrollIntoView({ behavior: 'smooth' }); });
        const nextBtn = ratingsTabContent.querySelector('#nextPage');
        if (nextBtn && !nextBtn.disabled) nextBtn.addEventListener('click', () => { currentPage++; renderAllItemsSection(currentPage, currentSort); allItemsSection.scrollIntoView({ behavior: 'smooth' }); });
      };

      renderAllItemsSection(currentPage, currentSort);

    } catch (error) {
      console.error('[UserRatings] Error displaying ratings list:', error);
      ratingsTabContent.innerHTML = `<div style="padding:2em;background:rgba(229,57,53,0.2);border:1px solid rgba(229,57,53,0.5);border-radius:8px;color:#ff6b6b;margin:2em;"><strong>Error:</strong> ${error.message}</div>`;
    }
  }

  // =========================================================================
  // Navigation & observer
  // =========================================================================
  function cleanupOnNavigate() {
    const oldUI = document.getElementById('user-ratings-ui');
    if (oldUI) oldUI.remove();

    // Hide all ratingsTab content panels (there may be one in each cached indexPage)
    document.querySelectorAll('#ratingsTab').forEach(el => {
      el.style.display = 'none';
      el.classList.add('hide');
      el.classList.remove('is-active');
    });

    isInjecting = false;
    injectionAttempts = 0;
    currentItemId = null;
  }

  let lastUrl = location.href;

  new MutationObserver((mutations) => {
    const url = location.href;

    if (url !== lastUrl) {
      lastUrl = url;
      cleanupOnNavigate();

      scheduleDetailInjection(150);

      if (url.includes('home')) {
        scheduleTabInjection(200);
      }
      return;
    }

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;

        const cl = node.classList;
        if (!cl) continue;

        if (cl.contains('detailPagePrimaryContent') ||
          cl.contains('detailSection') ||
          cl.contains('itemDetailPage')) {
          isInjecting = false;
          injectionAttempts = 0;
          scheduleDetailInjection(100);
          return;
        }

        // Tabs slider appeared OR an indexPage appeared — try tab injection
        if ((cl.contains('emby-tabs-slider') || cl.contains('homePage')) &&
          !document.querySelector('.emby-tabs-slider [data-ratings-tab="true"]')) {
          scheduleTabInjection(100);
          return;
        }
      }
    }
  }).observe(document.body, { subtree: true, childList: true });

  window.addEventListener('hashchange', () => {
    cleanupOnNavigate();

    const currentHash = window.location.hash;

    scheduleDetailInjection(150);
    if (currentHash.includes('home')) {
      scheduleTabInjection(200);
    }
  });

  // Initial injection
  scheduleDetailInjection(100);
  scheduleTabInjection(200);

  console.log('[UserRatings] Plugin setup complete');

})();
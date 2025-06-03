import { fetchCommits } from '../client/fetchCommits.js';
import { loadingAnimation } from '../html/loadingAnimation.js';

/**
 * Adds "Load More" button and fetches new commits on click.
 * @param {string} owner - The repo owner.
 * @param {string} repo - The repo name.
 * @param {Function} onNewCommits - Callback to handle new commits.
 * @returns {HTMLElement} Wrapper element with button.
 */
export function loadNext(owner, repo, onNewCommits) {
  const html = `
    <div class="paginate-container" data-pjax="" data-html-cleaner-suppress-children="">
      <div class="BtnGroup" data-test-selector="pagination">
        <a rel="nofollow" class="btn btn-outline BtnGroup-item" aria-disabled="false" id="olderButton">
          Load More
        </a>
      </div>
    </div>
  `;

  const style = `
    .paginate-container {
      width: 100%;
    }
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  wrapper.id = 'nextButtonWrapper';
  let page = 2;

  const styleEl = document.createElement('style');
  styleEl.textContent = style;
  wrapper.appendChild(styleEl);

  const olderButton = wrapper.querySelector('#olderButton');
  if (olderButton) {
    olderButton.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const nextButton = document.getElementById('nextButtonWrapper');
        nextButton.appendChild(loadingAnimation());

        const newCommits = await fetchCommits(owner, repo, page);
        page++;
        if (Array.isArray(newCommits) && typeof onNewCommits === 'function') {
          onNewCommits(newCommits);
        }
      } catch (err) {
        console.error('Failed to fetch more commits:', err);
      }
    });
  }

  return wrapper;
}

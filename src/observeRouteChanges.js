import { isRepoPage } from './github/isRepoPage.js';
import { addTabLink } from './github/addTabLink.js';
import { addGraphPage } from './github/addGraphPage.js';

export default function observeRouteChanges() {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (isRepoPage()) {
        addTabLink();
        addGraphPage();
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

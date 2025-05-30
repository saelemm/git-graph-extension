import { addTabLink } from './github/addTabLink.js';
import { addGraphPage } from './github/addGraphPage.js';
import observeRouteChanges from './observeRouteChanges.js';

function init() {
  addTabLink();
  if (location.pathname.endsWith('/graphs/git-graph')) {
    addGraphPage();
  }
  observeRouteChanges();
}

// Wait for DOM to be ready
if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}

// Support browser navigation (back/forward)
window.addEventListener('popstate', () => {
  if (location.pathname.endsWith('/graphs/git-graph')) {
    addGraphPage();
  } else {
    // fallback: allow GitHub to handle it naturally or reload
    location.reload();
  }
});

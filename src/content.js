import { observeTabInjection } from './github/observeTabInjection.js';
import { addGraphPage } from './github/addGraphPage.js';
import observeRouteChanges from './observeRouteChanges.js';

function init() {
  observeTabInjection();
  addGraphPage();
  observeRouteChanges();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

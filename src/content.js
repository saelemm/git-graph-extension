import { addTabLink } from './github/addTabLink.js';
import { addGraphPage } from './github/addGraphPage.js';
import observeRouteChanges from './observerRouteChanges.js';

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  addTabLink();
  addGraphPage();
  observeRouteChanges();
} else {
  window.addEventListener('DOMContentLoaded', () => {
    addTabLink();
    addGraphPage();
    observeRouteChanges();
  });
}

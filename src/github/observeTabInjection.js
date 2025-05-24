import { addTabLink } from './addTabLink.js';

export function observeTabInjection() {
  console.log('👀 Starting MutationObserver for nav bar...');

  const observer = new MutationObserver(() => {
    const navUl = document.querySelector('nav.UnderlineNav-body ul');
    if (navUl && !document.querySelector('#graph-tab')) {
      console.log('💡 Nav found. Attempting tab injection...');
      addTabLink();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try once after delay (GitHub delays layout)
  setTimeout(addTabLink, 1000);
}

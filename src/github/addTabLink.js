import { addGraphPage } from './addGraphPage.js';

export function addTabLink() {
  console.log('🔍 Checking for repo nav to inject Git Graph tab...');

  const firstTab = document.querySelector(
    "body > div.logged-in.env-production.page-responsive > div.position-relative.header-wrapper.js-header-wrapper > header > div.AppHeader-localBar > nav > ul > li:nth-child(1)"
  );
  const navUl = firstTab?.parentElement;

  if (!navUl) {
    console.warn('⚠️ Navigation UL not found.');
    return;
  }

  if (document.querySelector('li#graph-tab')) {
    console.log('⛔ Graph tab already exists.');
    return;
  }

  // Create new tab element
  const li = document.createElement("li");
  li.id = "graph-tab";
  li.setAttribute("data-view-component", "true");
  li.className = "d-inline-flex";

  const a = document.createElement("a");
  a.id = "graph-tab-link";
  const repoBasePath = location.pathname.split('/').slice(0, 3).join('/');
  a.href = repoBasePath + "/graphs/git-graph";
  a.setAttribute("data-tab-item", "i1graph-tab");
  a.setAttribute("data-view-component", "true");
  a.setAttribute("data-pjax", "#repo-content-pjax-container");
  a.setAttribute("data-turbo-frame", "repo-content-turbo-frame");
  a.className = "UnderlineNav-item no-wrap js-responsive-underlinenav-item";
  a.innerHTML = `
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16"
      class="octicon octicon-graph d-none d-sm-inline">
      <path d="M1 13h14v1H1v-1Zm2.354-2.854 2.147-2.146 3 3 4.147-4.146.707.707-4.5 4.5-3-3-1.44 1.44-.707-.707Z"></path>
    </svg>
    <span>Git Graph</span>
  `;

  // Prevent default nav behavior and render page manually
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const newUrl = a.href;
    if (location.href !== newUrl) {
      history.pushState(null, '', newUrl);
      addGraphPage();
    }
  });

  li.appendChild(a);
  navUl.insertBefore(li, firstTab.nextSibling);

  console.log('✅ Git Graph tab injected!');
}

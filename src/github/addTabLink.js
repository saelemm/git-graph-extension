export function addTabLink() {
  console.log('🔍 Looking for GitHub repo nav bar...');

  // Find the navigation bar more generically
  const nav = document.querySelector('nav.UnderlineNav-body') || 
              document.querySelector('nav[aria-label="Repository"]');

  const navUl = nav?.querySelector('ul');
  if (!navUl) {
    console.log('⚠️ Could not find nav <ul> inside GitHub repo nav.');
    return;
  }

  if (document.querySelector('#graph-tab')) {
    console.log('⏭️ Git Graph tab already exists.');
    return;
  }

  const firstTab = navUl.querySelector('li');
  if (!firstTab) {
    console.log('⚠️ First tab not found.');
    return;
  }

  const li = document.createElement('li');
  li.id = 'graph-tab';
  li.className = 'd-inline-flex';
  li.setAttribute('data-view-component', 'true');

  const a = document.createElement('a');
  a.id = 'graph-tab-link';
  a.href = location.pathname.replace(/\/$/, '') + '/graphs/git-graph';
  a.className = 'UnderlineNav-item no-wrap js-responsive-underlinenav-item';
  a.setAttribute('data-tab-item', 'i1graph-tab');
  a.setAttribute('data-view-component', 'true');
  a.setAttribute('data-pjax', '#repo-content-pjax-container');
  a.setAttribute('data-turbo-frame', 'repo-content-turbo-frame');

  a.innerHTML = `
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16"
      class="octicon octicon-graph d-none d-sm-inline">
      <path d="M1 13h14v1H1v-1Zm2.354-2.854 2.147-2.146 3 3 4.147-4.146.707.707-4.5 4.5-3-3-1.44 1.44-.707-.707Z"></path>
    </svg>
    <span>Git Graph</span>
  `;

  li.appendChild(a);
  navUl.insertBefore(li, firstTab.nextSibling);

  console.log('✅ Git Graph tab added.');
}

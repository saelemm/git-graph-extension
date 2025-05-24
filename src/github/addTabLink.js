export function addTabLink() {
    // Ensure we're on a GitHub repo page with a header nav bar
    const firstTab = document.querySelector(
      "body > div.logged-in.env-production.page-responsive > div.position-relative.header-wrapper.js-header-wrapper > header > div.AppHeader-localBar > nav > ul > li:nth-child(1)"
    );
    const navUl = firstTab?.parentElement;
  
    // Exit if nav not found or tab already exists
    if (!navUl || document.querySelector("li#graph-tab")) return;
  
    // Create new tab list item
    const li = document.createElement("li");
    li.id = "graph-tab";
    li.setAttribute("data-view-component", "true");
    li.className = "d-inline-flex";
  
    // Create anchor element with icon and label
    const a = document.createElement("a");
    a.id = "graph-tab-link";
    a.href = location.pathname.replace(/\/$/, '') + "/graphs/git-graph";
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
  
    li.appendChild(a);
  
    // Insert tab after the first item
    navUl.insertBefore(li, firstTab.nextSibling);
  }
  
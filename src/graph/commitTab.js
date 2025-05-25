// Vanilla JS function to render commits inside a container element
export function commitTab(container, commits) {
    if (!container) {
      console.error("Container element not found");
      return;
    }
  
    // Clear existing content
    container.innerHTML = "";
  
    // Set some container styles similar to your React root
    container.style.backgroundColor = "#111827"; // bg-gray-900
    container.style.color = "white";
    container.style.minHeight = "100vh";
    container.style.padding = "1rem";
  
    // Create inner wrapper (max width)
    const wrapper = document.createElement("div");
    wrapper.style.maxWidth = "72rem"; // max-w-6xl
    wrapper.style.margin = "0 auto";
    container.appendChild(wrapper);
  
    // Create commits list container
    const list = document.createElement("div");
    wrapper.appendChild(list);
  
    commits.forEach((commit) => {
      // Commit container
      const commitDiv = document.createElement("div");
      commitDiv.style.display = "flex";
      commitDiv.style.justifyContent = "space-between";
      commitDiv.style.alignItems = "center";
      commitDiv.style.padding = "0.75rem 1rem";
      commitDiv.style.borderBottom = "1px solid #1f2937"; // border-gray-800
      commitDiv.style.transition = "background-color 0.3s";
  
      commitDiv.addEventListener("mouseenter", () => {
        commitDiv.style.backgroundColor = "rgba(31, 41, 55, 0.5)"; // hover:bg-gray-800/50
      });
      commitDiv.addEventListener("mouseleave", () => {
        commitDiv.style.backgroundColor = "transparent";
      });
  
      list.appendChild(commitDiv);
  
      // Left part (author info and message)
      const leftDiv = document.createElement("div");
      leftDiv.style.display = "flex";
      leftDiv.style.alignItems = "center";
      leftDiv.style.gap = "0.75rem";
      leftDiv.style.flex = "1";
  
      commitDiv.appendChild(leftDiv);
  
      // Author avatar placeholder (circle)
      const avatarWrapper = document.createElement("div");
      avatarWrapper.style.width = "24px";
      avatarWrapper.style.height = "24px";
      avatarWrapper.style.borderRadius = "50%";
      avatarWrapper.style.overflow = "hidden";
      avatarWrapper.style.flexShrink = "0";
  
      const avatarImg = document.createElement("img");
      avatarImg.src = commit.author.avatar_url; // static placeholder
      avatarImg.alt = "/placeholder.svg?height=24&width=24"; // static placeholder
      avatarImg.width = 24;
      avatarImg.height = 24;
      avatarImg.style.objectFit = "cover";
  
      avatarWrapper.appendChild(avatarImg);
      leftDiv.appendChild(avatarWrapper);
  
      // Commit message and author details container
      const messageContainer = document.createElement("div");
      messageContainer.style.flex = "1";
      messageContainer.style.minWidth = "0";
  
      leftDiv.appendChild(messageContainer);
  
      // Commit message (bold, truncated)
      const messageLink = document.createElement("a");
      messageLink.textContent = commit.commit.message;
      messageLink.href = commit.html_url;
      messageLink.target = "_blank";
      messageLink.style.fontWeight = "500";
      messageLink.style.whiteSpace = "nowrap";
      messageLink.style.overflow = "hidden";
      messageLink.style.textOverflow = "ellipsis";
      messageLink.style.color = "white";
  
      messageContainer.appendChild(messageLink);
  
      // Author, timestamp, verified icon container
      const detailsDiv = document.createElement("div");
      detailsDiv.style.display = "flex";
      detailsDiv.style.alignItems = "center";
      detailsDiv.style.gap = "0.5rem";
      detailsDiv.style.marginTop = "0.25rem";
  
      messageContainer.appendChild(detailsDiv);
  
      // Author name
      const authorSpan = document.createElement("a");
      authorSpan.textContent = commit.author.login;
      authorSpan.href = commit.author.html_url;
      authorSpan.target = "_blank";
      authorSpan.style.color = "#9ca3af"; // text-gray-400
      authorSpan.style.fontSize = "0.875rem"; // text-sm
      detailsDiv.appendChild(authorSpan);

            // Author name
        const dateSpan = document.createElement("span");
        dateSpan.textContent = commit.commit.committer.date;
        dateSpan.style.color = "#9ca3af"; // text-gray-400
        dateSpan.style.fontSize = "0.875rem"; // text-sm
        detailsDiv.appendChild(dateSpan);
  
      // Timestamp
      const timestampSpan = document.createElement("span");
      timestampSpan.textContent = commit.commit.timestamp;
      timestampSpan.style.color = "#6b7280"; // text-gray-500
      timestampSpan.style.fontSize = "0.875rem";
      detailsDiv.appendChild(timestampSpan);
  
      // Verified checkmark (using Unicode checkmark for simplicity)
      if (commit.verified) {
        const verifiedSpan = document.createElement("span");
        verifiedSpan.textContent = "✔"; 
        verifiedSpan.style.color = "#22c55e"; // green-500
        verifiedSpan.style.fontSize = "1rem";
        detailsDiv.appendChild(verifiedSpan);
      }
  
      // Right part (hash and buttons)
      const rightDiv = document.createElement("div");
      rightDiv.style.display = "flex";
      rightDiv.style.alignItems = "center";
      rightDiv.style.gap = "0.5rem";
      rightDiv.style.marginLeft = "1rem";
  
      commitDiv.appendChild(rightDiv);
  
// Commit hash box
const hashDiv = document.createElement("div");
hashDiv.textContent = commit.commit.tree.sha.slice(0, 7); // Only first 7 characters
hashDiv.style.backgroundColor = "#1f2937"; // bg-gray-800
hashDiv.style.padding = "0.25rem 0.75rem";
hashDiv.style.borderRadius = "0.375rem"; // rounded
hashDiv.style.fontSize = "0.875rem";
hashDiv.style.fontFamily = "monospace";
hashDiv.style.color = "#3b82f6"; // text-blue-400
rightDiv.appendChild(hashDiv);
  
      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.style.background = "transparent";
      copyBtn.style.border = "none";
      copyBtn.style.color = "#9ca3af";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.fontSize = "0.875rem";
      copyBtn.style.padding = "0.25rem";
      copyBtn.title = "Copy commit hash";
  
      copyBtn.onmouseenter = () => {
        copyBtn.style.color = "white";
        copyBtn.style.backgroundColor = "#374151"; // hover:bg-gray-700
      };
      copyBtn.onmouseleave = () => {
        copyBtn.style.color = "#9ca3af";
        copyBtn.style.backgroundColor = "transparent";
      };
  
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(commit.commit.tree.sha)
      };
  
      rightDiv.appendChild(copyBtn);
    });
  }
  
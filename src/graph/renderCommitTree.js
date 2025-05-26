import * as d3 from "d3";

// Step 1: Build commit tree
function buildHierarchy(nodeMap) {
    const nodes = new Map();

    for (const [sha, node] of nodeMap.entries()) {
        nodes.set(sha, {
            sha,
            message: node.message,
            parents: node.parents,
            children: []
        });
    }

    for (const node of nodes.values()) {
        for (const parentSha of node.parents || []) {
            const parentNode = nodes.get(parentSha);
            if (parentNode) {
                parentNode.children.push(node);
            }
        }
    }

    const rootNodes = Array.from(nodes.values()).filter(n => (n.parents?.length ?? 0) === 0);
    return { sha: "ROOT", children: rootNodes };
}

// Step 2: Assign columns to branches (forks move right)
function assignBranchColumns(root, nodeMap) {
    const branchAssignments = new Map();
    let nextColumn = 1;

    function dfs(node, parentBranch = 0) {
        if (branchAssignments.has(node.sha)) return;

        let branchIndex = parentBranch;

        if (node.parents?.length === 1) {
            const parentSha = node.parents[0];
            const parentNode = nodeMap.get(parentSha);
            const parentBranchIndex = branchAssignments.get(parentSha);

            if (parentNode && parentNode.children.length > 1) {
                // Fork: multiple children = new column
                branchIndex = nextColumn++;
            } else {
                branchIndex = parentBranchIndex ?? 0;
            }
        } else if (node.parents?.length > 1) {
            // Merge: use leftmost (lowest) branch
            const parentBranches = node.parents.map(p => branchAssignments.get(p) ?? 0);
            branchIndex = Math.min(...parentBranches);
        }

        branchAssignments.set(node.sha, branchIndex);

        for (const child of node.children) {
            dfs(child, branchIndex);
        }
    }

    for (const child of root.children) {
        dfs(child, 0);
    }

    return branchAssignments;
}

// Step 3: Render tree
export function renderCommitTree(container, nodeMap) {
    container.innerHTML = "";

    const treeData = buildHierarchy(nodeMap);
    const hierarchy = d3.hierarchy(treeData, d => d.children);

    const nodeMapLookup = new Map();
    const shaNodeMap = new Map();
    hierarchy.each(d => {
        nodeMapLookup.set(d.data.sha, d);
        shaNodeMap.set(d.data.sha, d.data);
    });

    const branchAssignments = assignBranchColumns(treeData, shaNodeMap);

    const branchSpacing = 80;
    const verticalSpacing = 60;

    // Topological order — reverse for bottom-to-top
    const flatNodes = hierarchy.descendants().filter(d => d.data.sha !== "ROOT");
    const yPositions = new Map();
    let y = 0;
    for (let i = flatNodes.length - 1; i >= 0; i--) {
        yPositions.set(flatNodes[i].data.sha, y++);
    }

    // Assign layout positions
    flatNodes.forEach(d => {
        const branch = branchAssignments.get(d.data.sha) ?? 0;
        d.x = branch * branchSpacing;
        d.y = yPositions.get(d.data.sha) * verticalSpacing;
    });

    // Build links
    const updatedLinks = [];
    for (const node of flatNodes) {
        for (const parentSha of node.data.parents || []) {
            const parent = nodeMapLookup.get(parentSha);
            if (parent) {
                updatedLinks.push({ source: node, target: parent }); // flipped: child → parent (bottom to top)
            }
        }
    }

    const width = 1000;
    const height = flatNodes.length * verticalSpacing + 100;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#111");

    const g = svg.append("g").attr("transform", "translate(50,50)");

    // Draw links
    g.selectAll("path")
        .data(updatedLinks)
        .enter()
        .append("path")
        .attr("d", d => {
            const x1 = d.source.x, y1 = d.source.y;
            const x2 = d.target.x, y2 = d.target.y;

            if (x1 === x2) {
                return `M ${x1},${y1} L ${x2},${y2}`;
            } else {
                const midX = (x1 + x2) / 2;
                return `M ${x1},${y1}
                        C ${midX},${y1}
                          ${midX},${y2}
                          ${x2},${y2}`;
            }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Draw commit nodes
    g.selectAll("circle")
        .data(flatNodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 6)
        .attr("fill", "#f90");

    // Draw commit messages
    g.selectAll("text")
        .data(flatNodes)
        .enter()
        .append("text")
        .attr("x", d => d.x + 10)
        .attr("y", d => d.y + 4)
        .text(d => d.data.message || d.data.sha)
        .attr("fill", "#ccc")
        .style("font-size", "12px");
}

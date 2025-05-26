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
                branchIndex = nextColumn++;
            } else {
                branchIndex = parentBranchIndex ?? 0;
            }
        } else if (node.parents?.length > 1) {
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

// Step 3: Assign fixed rows (one row per commit)
function assignGridPositionsTopological(flatNodes, branchAssignments) {
    const positions = new Map();
    const visited = new Set();
    const tempMark = new Set();
    let currentRow = 0;

    // Build graph edges
    const edges = new Map();
    for (const node of flatNodes) {
        edges.set(node.data.sha, node.data.parents || []);
    }

    function visit(sha) {
        if (visited.has(sha)) return;
        if (tempMark.has(sha)) throw new Error("Graph is not a DAG");

        tempMark.add(sha);
        for (const parent of edges.get(sha) || []) {
            visit(parent);
        }
        tempMark.delete(sha);
        visited.add(sha);

        const col = branchAssignments.get(sha) ?? 0;
        positions.set(sha, { col, row: currentRow++ });
    }

    for (const node of flatNodes) {
        visit(node.data.sha);
    }

    return positions;
}



// Step 4: Render
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

    const flatNodes = hierarchy.descendants().filter(d => d.data.sha !== "ROOT");
    const branchAssignments = assignBranchColumns(treeData, shaNodeMap);
    const gridPositions = assignGridPositionsTopological(flatNodes, branchAssignments);

    const branchSpacing = 100;
    const rowHeight = 80;
    const margin = { top: 50, left: 60 };

    // Position nodes
    flatNodes.forEach(d => {
        const pos = gridPositions.get(d.data.sha);
        d.x = pos.col * branchSpacing + margin.left;
        d.y = (flatNodes.length - pos.row - 1) * rowHeight + margin.top; // bottom-up
    });

    // Build links
    const updatedLinks = [];
    for (const node of flatNodes) {
        for (const parentSha of node.data.parents || []) {
            const parent = nodeMapLookup.get(parentSha);
            if (parent) {
                updatedLinks.push({ source: node, target: parent });
            }
        }
    }

    const numColumns = Math.max(...[...branchAssignments.values()]) + 1;
    const svgWidth = numColumns * branchSpacing + margin.left * 2;
    const svgHeight = flatNodes.length * rowHeight + margin.top * 2;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("background", "#111")
        .style("max-width", "100%")
        .style("overflow", "visible");

    const g = svg.append("g");

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
                const curveOffset = 40;
return `M ${x1},${y1}
        C ${x1 + curveOffset},${y1}
          ${x2 - curveOffset},${y2}
          ${x2},${y2}`;
            }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Draw nodes
    g.selectAll("circle")
        .data(flatNodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 6)
        .attr("fill", "#f90");

    // Draw messages
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
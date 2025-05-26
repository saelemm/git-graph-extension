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

// Step 2: Assign columns to branches with proper column recycling
function assignBranchColumns(root, nodeMap) {
    const branchAssignments = new Map();
    const usedColumns = new Set();
    const freedColumns = new Set(); // for reuse
    let maxColumn = 0;

    function getFirstFreeColumn() {
        if (freedColumns.size > 0) {
            const sorted = [...freedColumns].sort((a, b) => a - b);
            const col = sorted[0];
            freedColumns.delete(col);
            usedColumns.add(col);
            return col;
        }

        while (usedColumns.has(maxColumn)) {
            maxColumn++;
        }
        usedColumns.add(maxColumn);
        return maxColumn;
    }

    function assignColumns(node, parentColumn = 0) {
        if (branchAssignments.has(node.sha)) return;

        let assignedColumn = parentColumn;
        let columnsToFree = [];

        const parentSha = node.parents?.[0];
        const parentNode = parentSha ? nodeMap.get(parentSha) : null;
        const parentAssignedCol = parentSha ? branchAssignments.get(parentSha) ?? 0 : 0;

        const isFork = (
            parentNode &&
            parentNode.children.length > 1 &&
            parentNode.children[0].sha !== node.sha
        );

        if (node.parents?.length > 1) {
            // Merge commit
            const parentColumns = node.parents
                .map(p => branchAssignments.get(p))
                .filter(col => col !== undefined);

            assignedColumn = parentColumns.length ? Math.min(...parentColumns) : getFirstFreeColumn();

            // Track other merged-in columns for freeing
            columnsToFree = parentColumns.filter(col => col !== assignedColumn);
        } else if (node.parents?.length === 1 && isFork) {
            assignedColumn = getFirstFreeColumn();
        } else if (node.parents?.length === 1) {
            assignedColumn = parentAssignedCol;
        } else {
            // Root commit
            assignedColumn = getFirstFreeColumn();
        }

        branchAssignments.set(node.sha, assignedColumn);
        usedColumns.add(assignedColumn);
        maxColumn = Math.max(maxColumn, assignedColumn);

        // Recurse on children
        for (const child of node.children) {
            assignColumns(child, assignedColumn);
        }

        // Free merged columns *after* children have been assigned
        for (const col of columnsToFree) {
            if (usedColumns.has(col)) {
                usedColumns.delete(col);
                freedColumns.add(col);
            }
        }
    }

    for (const child of root.children) {
        assignColumns(child, 0);
    }

    return branchAssignments;
}

// Step 3: Assign fixed rows (one row per commit)
function assignGridPositionsTopological(flatNodes, branchAssignments) {
    const positions = new Map();
    const visited = new Set();
    const tempMark = new Set();
    let currentRow = 0;

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

        // Just use the precomputed branch column
        const col = branchAssignments.get(sha) ?? 0;
        positions.set(sha, { col, row: currentRow++ });
    }

    // Ensure deterministic order of node visiting (stable topological sort)
    const sorted = [...flatNodes].sort((a, b) => {
        const aParents = a.data.parents?.length || 0;
        const bParents = b.data.parents?.length || 0;
        if (aParents !== bParents) return aParents - bParents;
        return a.data.sha.localeCompare(b.data.sha); // fallback
    });

    for (const node of sorted) {
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
    
    // Use the original branch assignment function instead of topological
    const branchAssignments = assignBranchColumns(treeData, shaNodeMap);
    const gridPositions = assignGridPositionsTopological(flatNodes, branchAssignments);

    const branchSpacing = 100;
    const rowHeight = 60;
    const margin = { top: 10, left: 30 };

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
        .attr("height", "100%")
        .style("background", "#111")
        .style("max-width", "100%")
        .style("overflow", "visible");

    const g = svg.append("g");
    svg.style.display = "block"

    // Draw links
    g.selectAll("path")
        .data(updatedLinks)
        .attr("height", "100%")
        .enter()
        .append("path")
        .attr("d", d => {
            const x1 = d.source.x, y1 = d.source.y;
            const x2 = d.target.x, y2 = d.target.y;

            if (x1 === x2) {
                return `M ${x1},${y1} L ${x2},${y2}`;
            } else {
                const curveOffset = 60;
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
        .text(d => d.data.message)
        .attr("fill", "#ccc")
        .style("font-size", "12px");
}
/* global vis */

function processEdgeColors(edges) {
    return edges.map(edge => {
        const colorMap = {
            proves: 'green',
            disproves: 'red',
            answers: 'purple',
            is_premise_of: 'orange'
        };
        const color = colorMap[edge.link_type] || 'black'; // Default color
        return {
            ...edge,
            color,
            margin: 20
        };
    });
}

function initializeNetwork(graphData, container) {
    // Create virtual nodes for links with incoming links
    // Links may go to links. Vis.js supports only links going to nodes. So, as a workaround,
    // for every edge with incomming links, we create a "virtual node" associated with that link.
    // Mapping virtual nodes to their corresponding edges
    const virtualNodeToEdge = new Map();

    // Update edge targets and create virtual nodes
    graphData.edges.forEach(edge => {
        if (typeof edge.to === 'string' && edge.to.startsWith('L')) {
            const virtualNodeId = 'V' + edge.to.substring(1);
            virtualNodeToEdge.set(virtualNodeId, edge);
            edge.to = virtualNodeId; // Update the target of the edge to the virtual node ID
        }
    });

    // Create virtual nodes at midpoints of corresponding edges
    virtualNodeToEdge.forEach((edge, virtualNodeId) => {
        const sourceNode = graphData.nodes.get(edge.from);
        const targetNode = virtualNodeId; // Get the original target node

        if (sourceNode && targetNode) {
            // Add the virtual node at the midpoint
            graphData.nodes.add({
                id: virtualNodeId,
                label: '',
                group: 'virtual',
                hidden: false,
                size: 5,
                physics: {
                    enabled: false
                },
                shape: 'dot' // Set the shape to 'box' for rectangles
            });
        }
    });

    // Network options
    const options = {
        layout: {
            hierarchical: {
                enabled: true,
                levelSeparation: 100,
                edgeMinimization: true,
                sortMethod: 'directed',
                direction: 'DU',
                blockShifting: false,
                parentCentralization: true,
                nodeSpacing: 310,
                treeSpacing: 320
            }
        },
        physics: {
            enabled: true
            // hierarchicalRepulsion: {
            //     nodeDistance: 0,
            //     springLength: 0,
            //     avoidOverlap: 0.5
            // }
        },
        edges: {
            smooth: false, // Make edges straight
            physics: false,
            arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow' } }
        },
        nodes: {
            shape: 'box', // Set the shape to 'box' for rectangles
            widthConstraint: {
                maximum: 300 // Limit node width to 300px
            },
            font: {
                multi: 'html' // Enable HTML for multiline text
            }
        }
    };

    const network = new vis.Network(container, graphData, options);
    return network;
}

export { processEdgeColors, initializeNetwork };

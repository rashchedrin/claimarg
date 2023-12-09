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
            enabled: false,
            hierarchicalRepulsion: {
                nodeDistance: 0,
                springLength: 0,
                avoidOverlap: 0.5
            }
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

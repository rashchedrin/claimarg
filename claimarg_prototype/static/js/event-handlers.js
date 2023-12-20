/* global vis */

import { processEdgeColors, initializeNetwork } from './graph-initialization.js';
import { createPopupMenu, closeAllPopups, createEdgePopupMenu } from './popup-management.js';
import { getParameterByName } from './utils.js';

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllPopups();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const messageId = getParameterByName('messageId');
    fetch('/core/graph_data/')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('network');
            const processedEdges = processEdgeColors(data.edges);
            const graphData = {
                nodes: new vis.DataSet(data.nodes),
                edges: new vis.DataSet(processedEdges)
            };

            const network = initializeNetwork(graphData, container);

            // If messageId is present, focus on the node with that ID
            if (messageId) {
                network.selectNodes([messageId]);
                network.focus(messageId, { scale: 1 });
            }

            network.on('click', function(params) {
                closeAllPopups()
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    const nodePosition = params.pointer.DOM;
                    createPopupMenu(nodeId, nodePosition, container, graphData);
                } else if (params.edges.length > 0) {
                    const edgeId = params.edges[0];
                    const edgePosition = params.pointer.DOM;
                    createEdgePopupMenu(edgeId, edgePosition, container, graphData);
                }
            });
        });
});

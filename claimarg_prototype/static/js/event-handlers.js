import { processEdgeColors, initializeNetwork } from './graph-initialization.js';
import { createPopupMenu, closeAllPopups } from './popup-management.js';
import { getParameterByName } from './utils.js';

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllPopups();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var messageId = getParameterByName('messageId');
    fetch('/core/graph_data/')
        .then(response => response.json())
        .then(data => {
            var container = document.getElementById('network');
            var processedEdges = processEdgeColors(data.edges);
            var graphData = {
                nodes: new vis.DataSet(data.nodes),
                edges: new vis.DataSet(processedEdges)
            };

            var network = initializeNetwork(graphData, container);

            // If messageId is present, focus on the node with that ID
            if (messageId) {
                network.selectNodes([messageId]);
                network.focus(messageId, { scale: 1 });
            }

            network.on("click", function(params) {
                closeAllPopups()
                if (params.nodes.length > 0) {
                    var nodeId = params.nodes[0];
                    var nodePosition = params.pointer.DOM;
                    createPopupMenu(nodeId, nodePosition, container, graphData);
                }
            });
        });
});
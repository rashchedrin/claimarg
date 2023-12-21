// The existing updateVirtualNodePositions function can now use these helpers
function updateVirtualNodePositions(network) {
    const nodesToUpdate = [];

    network.body.data.nodes.forEach(node => {
        if (String(node.id).startsWith('V')) {
            const linkedEdgeId = parseInt(node.id.substring(1)); // Extract the original edge ID
            const linkedEdge = network.body.data.edges.get(linkedEdgeId);

            if (linkedEdge) {
                const fromNodePosition = network.getPositions([linkedEdge.from])[linkedEdge.from];
                const toNodePosition = network.getPositions([linkedEdge.to])[linkedEdge.to];

                if (fromNodePosition && toNodePosition) {
                    const midpoint = {
                        x: (fromNodePosition.x + toNodePosition.x) / 2,
                        y: (fromNodePosition.y + toNodePosition.y) / 2
                    };

                    nodesToUpdate.push({id: node.id, x: midpoint.x, y: midpoint.y, fixed: true});
                }
            }
        }
    });

    if (nodesToUpdate.length > 0) {
        network.body.data.nodes.update(nodesToUpdate);
    }
}

export { updateVirtualNodePositions };

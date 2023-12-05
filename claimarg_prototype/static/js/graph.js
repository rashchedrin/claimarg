// static/graph.js
document.addEventListener('DOMContentLoaded', function() {
    fetch('/core/graph_data/')
        .then(response => response.json())
        .then(data => {
            var container = document.getElementById('network');
            var graphData = {
                nodes: new vis.DataSet(data.nodes),
                edges: new vis.DataSet(data.edges)
            };
            var options = {};
            new vis.Network(container, graphData, options);
        });
});

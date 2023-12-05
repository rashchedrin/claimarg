
document.addEventListener('DOMContentLoaded', function() {
    fetch('/core/graph_data/')
        .then(response => response.json())
        .then(data => {
            var container = document.getElementById('network');

            // Process edges to add colors
            console.log(data.edges);
            var edges = data.edges.map(edge => {
                var color = '';
                switch (edge.link_type) {
                    case 'proves':
                        color = 'green';
                        break;
                    case 'disproves':
                        color = 'red';
                        break;
                    case 'answers':
                        color = 'purple';
                        break;
                    case 'is_premise_of':
                        color = 'orange';
                        break;
                    default:
                        color = 'yellow'; // Default color, just in case
                }
                return { ...edge, color: color };
            });

            var graphData = {
                nodes: new vis.DataSet(data.nodes),
                edges: new vis.DataSet(edges)
            };

            var options = {
                edges: {
                    arrows: {
                        to: { enabled: true, scaleFactor: 1, type: 'arrow' }
                    }
                }
                // Other options as needed
            };

            new vis.Network(container, graphData, options);
        });
});

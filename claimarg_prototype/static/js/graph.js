
document.addEventListener('DOMContentLoaded', function() {
    fetch('/core/graph_data/')
        .then(response => response.json())
        .then(data => {
            var container = document.getElementById('network');

            // Process edges to add colors
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
                        color = 'black'; // Default color
                }
                return { ...edge, color: color };
            });

            var graphData = {
                nodes: new vis.DataSet(data.nodes),
                edges: new vis.DataSet(edges)
            };

            var options = {
                edges: {
                    arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow' } }
                }
                // Other options as needed
            };

            var network = new vis.Network(container, graphData, options);

            // Function to create a popup menu
            function createPopupMenu(nodeId, coordinates) {
                var popup = document.createElement("div");
                popup.classList.add("popup-menu");
                var containerRect = container.getBoundingClientRect();
    
                // Consider page scrolling
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                // Adjust coordinates with container's offset and scroll
                var top = coordinates.y + containerRect.top + scrollTop;
                var left = coordinates.x + containerRect.left + scrollLeft;

                popup.style.top = top + "px";
                popup.style.left = left + "px";

                var deleteButton = document.createElement("button");
                deleteButton.innerHTML = "D";
                deleteButton.onclick = function() {
                    deleteNode(nodeId);
                    document.body.removeChild(popup); // Remove the popup after clicking
                };
                popup.appendChild(deleteButton);

                document.body.appendChild(popup);
            }

            // Function to delete a node
            function deleteNode(nodeId) {
                fetch('/core/delete_message/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') // Function to get CSRF token
                    },
                    body: JSON.stringify({ message_id: nodeId })
                }).then(response => {
                    if (response.ok) {
                        graphData.nodes.remove(nodeId); // Remove the node from the graph
                    }
                });
            }

            // Function to get CSRF token
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

            // Event listener for node clicks
            network.on("click", function(params) {
                console.log("clicked");
                if (params.nodes.length > 0) {
                    var nodeId = params.nodes[0];
                    var nodePosition = params.pointer.DOM;
                    createPopupMenu(nodeId, nodePosition);
                }
            });
        });
});

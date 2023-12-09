function processEdgeColors(edges) {
    return edges.map(edge => {
        var colorMap = {
            'proves': 'green',
            'disproves': 'red',
            'answers': 'purple',
            'is_premise_of': 'orange'
        };
        var color = colorMap[edge.link_type] || 'black'; // Default color
        return { ...edge, 
            color: color,
            margin: 20, 
        };
    });
}

function initializeNetwork(graphData, container) {
    var options = {
        layout: {
            hierarchical: {
              enabled: true,
              levelSeparation: 50,
              edgeMinimization: true,
              sortMethod: 'directed',
              direction: 'DU',
              blockShifting: false,
              parentCentralization: true,
              nodeSpacing: 310,
              treeSpacing: 320,
            },
          },
          physics: {
            enabled: false,
            hierarchicalRepulsion: {
              nodeDistance: 0,
              springLength: 0,
              avoidOverlap: 0.5,
            },
          },
        edges: {
            smooth: false,  // Make edges straight
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
            },
        },
    };

    var network = new vis.Network(container, graphData, options);
    return network;
}

// Function to create a popup menu
function createPopupMenu(nodeId, coordinates, container, graphData) {
    var popup = createPopupElement(coordinates, container);

    addDeleteButton(nodeId, popup, graphData);
    addCloseButton(popup);
    addCopyLinkButton(nodeId, popup);
    addAddMessageButton(nodeId, popup, graphData);

    document.body.appendChild(popup);
}

function addCopyLinkButton(nodeId, popup) {
    // Create a button to copy the link to clicked node
    var copyLinkButton = document.createElement("button");
    copyLinkButton.innerHTML = "Copy Link";
    copyLinkButton.onclick = function() {
        copyNodeLink(nodeId);
    };
    popup.appendChild(copyLinkButton);
}

function createPopupElement(coordinates, container) {
    var popup = document.createElement("div");
    popup.classList.add("popup-menu");

    var position = calculatePopupPosition(coordinates, container);
    popup.style.top = position.top + "px";
    popup.style.left = position.left + "px";

    return popup;
}

function calculatePopupPosition(coordinates, container) {
    var containerRect = container.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
        top: coordinates.y + containerRect.top + scrollTop,
        left: coordinates.x + containerRect.left + scrollLeft
    };
}

function addDeleteButton(nodeId, popup, graphData) {
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        // Display confirmation dialog
        var confirmDelete = confirm("Are you sure you want to delete this node?");
        if (confirmDelete) {
            deleteNode(nodeId, graphData);
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }
    };
    popup.appendChild(deleteButton);
}

function addCloseButton(popup) {
    var closeButton = document.createElement("button");
    closeButton.innerHTML = "Close";
    closeButton.onclick = function() {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    };
    popup.appendChild(closeButton);
}

function deleteNode(nodeId, graphData) {
    fetch('/core/delete_message/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ message_id: nodeId })
    }).then(response => {
        if (response.ok) {
            graphData.nodes.remove(nodeId); // Remove the node from the graph
        }
    });
}


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
                if (params.nodes.length > 0) {
                    var nodeId = params.nodes[0];
                    var nodePosition = params.pointer.DOM;
                    createPopupMenu(nodeId, nodePosition, container, graphData);
                }
            });
        });
});

// Function to get URL parameter by name
function getParameterByName(name, url) {
    if (!url) url = window.location.href;

    // Create a URLSearchParams object with the given URL
    var searchParams = new URLSearchParams(new URL(url).search);

    // Get the parameter value by name
    return searchParams.get(name);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllPopups();
    }
});

function closeAllPopups() {
    var popups = document.querySelectorAll('.popup-menu');
    popups.forEach(function(popup) {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    });
}


// Function to copy the link to the node
function copyNodeLink(nodeId) {
    var nodeLink = window.location.origin + '/core/post_message/?messageId=' + nodeId;

    // Create a temporary textarea to copy the link
    var textarea = document.createElement('textarea');
    textarea.value = nodeLink;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Optionally, provide feedback to the user (e.g., display a tooltip)
    alert('Link copied to clipboard!');
}

/////////

function addAddMessageButton(nodeId, popup, graphData) {
    var addMessageButton = document.createElement("button");
    addMessageButton.innerHTML = "Add Message";
    addMessageButton.onclick = function() {
        // Display form for adding a new message
        showAddMessageForm(nodeId, popup, graphData);
    };
    popup.appendChild(addMessageButton);
}

// Declare configuration arrays as pairs
var messageTypeOptions = [['Claim', 'claim'], ['Question', 'question'], ['Argument', 'argument']];
var linkTypeOptions = [
    ['Proves', 'proves'],
    ['Disproves', 'disproves'],
    ['Answers', 'answers'],
    ['Is Premise Of', 'is_premise_of']
];


function showAddMessageForm(nodeId, popup, graphData) {
    // Create form elements
    var form = document.createElement("form");
    var textarea = document.createElement("textarea");
    var messageTypeSelect = createSelect(messageTypeOptions, "type");  // Set id attribute
    var linkTypeSelect = createSelect(linkTypeOptions, "linkType");  // Set id attribute
    var submitButton = document.createElement("button");

    // Set attributes and innerHTML
    textarea.name = "message_content";
    submitButton.innerHTML = "Submit";

    // Append elements to form
    form.appendChild(textarea);
    form.appendChild(messageTypeSelect);
    form.appendChild(linkTypeSelect);
    form.appendChild(submitButton);

    form.onsubmit = function(event) {
        event.preventDefault();
    
        // Retrieve form values using the correct IDs
        var content = textarea.value;
        var type = messageTypeSelect.value;
        var linkType = linkTypeSelect.value;
    
        // Add a new message and link
        addNewMessageAndLink(content, type, linkType, nodeId, graphData);
    
        // Remove the form from the popup
        if (form.parentNode) {
            form.parentNode.removeChild(form);
        }
    };

    popup.appendChild(form);
}

function createSelect(options, id) {
    var select = document.createElement("select");
    select.id = id;  // Set id attribute

    for (var i = 0; i < options.length; i++) {
        var option = document.createElement("option");
        option.value = options[i][1];
        option.text = options[i][0];
        select.appendChild(option);
    }
    return select;
}

function addNewMessageAndLink(content, type, linkType, sourceNodeId, graphData) {
    // Make a POST request to add a new message
    fetch('/core/add_message/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            'content': content,
            'type': type,
            'link_type': linkType,  // Include link_type
            'target_message_id': sourceNodeId  // Include sourceNodeId as the target_message_id
        })
    })
    .then(response => response.json())
    .then(data => {
        // Add the new message to the graph data
        graphData.nodes.add({
            id: data.message_id,  // Ensure this is the correct ID field from the response
            label: content,
            group: type
        });

        // Process the new link for color and add to graph data
        // Swapping 'from' and 'to' so the link goes from the new message to the source node
        let processedNewEdge = processEdgeColors([{
            from: data.message_id,  // New message is the source
            to: sourceNodeId,       // Existing node is the target
            link_type: linkType
        }])[0];  // processEdgeColors returns an array, get the first element

        graphData.edges.add(processedNewEdge);

        // Refresh the graph with the new data
        network.setData(graphData); // This line refreshes the graph with the new data
    });
}

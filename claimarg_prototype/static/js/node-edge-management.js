import { getCookie } from './utils.js';
import { processEdgeColors } from './graph-initialization.js';

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
        } else {
            // Handle non-OK responses
            response.json().then(data => {
                displayErrorMessage(`Failed to delete node: ${data.error || 'Unknown error'}`);
            }).catch(parseError => {
                displayErrorMessage('Failed to parse server response');
            });
        }
    }).catch(networkError => {
        // Handle network errors
        displayErrorMessage('Network error occurred while trying to delete node');
    });
}

function displayErrorMessage(message) {
    // Implement how you want to display the error message to the user
    // For example, using an alert or inserting the message into a specific element on your webpage
    alert(message); // This is a simple example using alert; consider using a more user-friendly approach
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
            content,
            type,
            link_type: linkType, // Include link_type
            target_message_id: sourceNodeId // Include sourceNodeId as the target_message_id
        })
    })
        .then(response => {
            if (!response.ok) {
            // Handle non-OK responses
                const errorMsg = 'Network response was not ok.';
                displayErrorMessage(errorMsg);
                throw new Error(errorMsg);
            }
            return response.json()
        })
        .then(data => {
        // Add the new message to the graph data
            graphData.nodes.add({
                id: data.message_id, // Ensure this is the correct ID field from the response
                label: content,
                group: type
            });

            // Process the new link for color and add to graph data
            // Swapping 'from' and 'to' so the link goes from the new message to the source node
            const processedNewEdge = processEdgeColors([{
                from: data.message_id, // New message is the source
                to: sourceNodeId, // Existing node is the target
                link_type: linkType
            }])[0]; // processEdgeColors returns an array, get the first element

            graphData.edges.add(processedNewEdge);

            // Refresh the graph with the new data
            // network.setData(graphData); // This line refreshes the graph with the new data
        });
}

export { addNewMessageAndLink, deleteNode };

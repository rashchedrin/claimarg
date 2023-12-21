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

function createLinkBetweenNodes(sourceNodeId, targetNodeId, graphData, linkType) {
    // Prepare the data to be sent
    const postData = {
        source_message: sourceNodeId,
        target_message: targetNodeId,
        link_type: linkType
    };

    // Make a POST request to the server
    fetch('/core/create_link_ajax/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Assuming you have a function to get CSRF token
        },
        body: JSON.stringify(postData)
    }).then(response => {
        if (response.ok) {
            // If the POST request was successful, update the graph
            const processedNewEdge = processEdgeColors([{
                from: sourceNodeId, // New message is the source
                to: targetNodeId, // Existing node is the target
                link_type: linkType
            }])[0]; // processEdgeColors returns an array, get the first element
            graphData.edges.add(processedNewEdge);

            // Optionally, refresh or update the network graph here
        } else {
            // Handle errors, e.g., display a message to the user
            const errorMsg = 'Failed to create link: ' + response.statusText;
            console.error(errorMsg);
            displayErrorMessage(errorMsg);
        }
    }).catch(error => {
        // Handle network errors
        const errorMsg = 'Network error: ' + error.message;
        console.error(errorMsg);
        displayErrorMessage(errorMsg);
    });
}

function deleteLink(linkId, graphData) {
    fetch('/core/delete_link/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({ link_id: linkId.toString() })
    }).then(response => {
        if (response.ok) {
            graphData.edges.remove(linkId); // Remove the link from the graph
        } else {
            // Handle non-OK responses
            response.text().then(text => {
                displayErrorMessage(`Failed to delete link: ${text}`);
            }).catch(parseError => {
                displayErrorMessage('Failed to parse server response');
            });
        }
    }).catch(networkError => {
        // Handle network errors
        displayErrorMessage('Network error occurred while trying to delete link');
    });
}

function addNewMessageAndAssociateWithLink(
    content,
    type,
    linkType,
    linkId,
    graphData
) {
    fetch('/core/add_message_and_link_to_link/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            content,
            type,
            link_id: linkId,
            link_type: linkType
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
            // Add the new message to the graph data
                graphData.nodes.add({
                    id: data.message_id,
                    label: content,
                    group: type
                });
            // Refresh the graph or perform other updates as needed
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayErrorMessage('Error occurred while adding message to link');
        });
}

export {
    addNewMessageAndLink,
    deleteNode,
    deleteLink,
    createLinkBetweenNodes,
    addNewMessageAndAssociateWithLink
};

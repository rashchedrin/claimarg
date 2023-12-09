// Function to get URL parameter by name
function getParameterByName(name, url) {
    if (!url) url = window.location.href;

    // Create a URLSearchParams object with the given URL
    const searchParams = new URLSearchParams(new URL(url).search);

    // Get the parameter value by name
    return searchParams.get(name);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export { getCookie, getParameterByName };

const baseUrl = "http://localhost:3001";

export const getAllTodos = async (queryParams) => {
    try {
        // Construct the query string from the provided queryParams object
        const queryString = new URLSearchParams(queryParams).toString();

        // Append the query string to the base URL
        const url = `${baseUrl}/tasks${queryString ? '?' + queryString : ''}`;

        // Make an HTTP GET request to the constructed URL
        const res = await fetch(url, { cache: "no-store" });

        // Check if the response is not successful
        if (!res.ok) {
            throw new Error('Failed to fetch todos');
        }

        // Parse the JSON response body and return it
        return res.json();
    } catch (error) {
        // If any errors occur during the process, throw them
        throw error;
    }
};


export const addTodo = async (newTodo) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newTodo),
        });
        if (!res.ok) {
            throw new Error('Failed to add todo');
        }
        return await res.json();
    } catch (error) {
        throw error;
    }
};

export const editTodo = async (todo) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/edit`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(todo),
        });
        if (!res.ok) {
            throw new Error('Failed to edit todo');
        }
        return await res.json();
    } catch (error) {
        throw error;
    }
};

export const deleteTodo = async (taskId) => {
    try {
        const res = await fetch(`${baseUrl}/tasks/${taskId}`, {method: "DELETE"});
        if (!res.ok) {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        throw error;
    }
};

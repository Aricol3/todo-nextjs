const baseUrl = "http://localhost:3001";
const maxRetryAttempts = 20;
const retryDelay = 3000;

const retry = async (fn, retriesLeft = maxRetryAttempts) => {
    try {
        return await fn();
    } catch (error) {
        if (retriesLeft === 0) {
            throw new Error('Max retries exceeded');
        }
        console.log("NU")
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return await retry(fn, retriesLeft - 1);
    }
};

export const getAllTodos = async (queryParams) => {
    try {
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `${baseUrl}/tasks${queryString ? '?' + queryString : ''}`;
        const res = await fetch(url, {cache: "no-store"});
        if (!res.ok) {
            throw new Error('Failed to fetch todos');
        }

        return res.json();
    } catch (error) {
        throw error;
    }
};


export const addTodo = async (newTodo) => {
    const addTodoAsync = async () => {
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
    }
    return await retry(addTodoAsync)
};

export const editTodo = async (todo) => {
    const editTodoAsync = async () => {
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
    }
    return await retry(editTodoAsync)
};

export const deleteTodo = async (taskId) => {
    const deleteTodoAsync = async () => {
        try {
            const res = await fetch(`${baseUrl}/tasks/${taskId}`, {method: "DELETE"});
            if (!res.ok) {
                throw new Error('Failed to delete todo');
            }
        } catch (error) {
            throw error;
        }
    }
    return await retry(deleteTodoAsync)
};

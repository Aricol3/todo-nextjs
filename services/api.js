const baseUrl = "http://localhost:3001"

export const getAllTodos = async () => {
    const res = await fetch(`${baseUrl}/tasks`, {cache: "no-store"});
    return res.json();
};

export const addTodo = async (newTodo) => {
    console.log(newTodo)
    const res = await fetch(`${baseUrl}/tasks/`, {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(newTodo),
    });
    return await res.json();
};

export const editTodo = async (todo) => {
    const res = await fetch(`${baseUrl}/tasks/${todo.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(todo),
    });
    return await res.json();
};

export const deleteTodo = async (taskId) => {
    await fetch(`${baseUrl}/tasks/${taskId}`, {method: "DELETE",});
};
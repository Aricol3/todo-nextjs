'use client'

const baseUrl = "https://localhost:3001";
const maxRetryAttempts = 20;
const retryDelay = 3000;

const fetchWithToken = async (url, options) => {
    const token = localStorage.getItem("token") || "";
    const headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };
    return fetch(url, {...options, headers});
};

export const authUser = async (email, password) => {
    try {
        const url = `${baseUrl}/login`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await res.json();
        const token = data.token;
        console.log("TOKEN", token)

        localStorage.setItem('token', token);
        return res;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (email, password) => {
    try {
        const url = `${baseUrl}/register`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        return res;
    } catch (error) {
        throw error;
    }
};


const retry = async (fn, retriesLeft = maxRetryAttempts) => {
    try {
        return await fn();
    } catch (error) {
        if (retriesLeft === 0) {
            throw new Error('Max retries exceeded');
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return await retry(fn, retriesLeft - 1);
    }
};

export const getAllTodos = async (queryParams) => {
    console.log("TOKEN???123", localStorage.getItem('token'))
    try {
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `${baseUrl}/tasks${queryString ? '?' + queryString : ''}`;
        const res = await fetchWithToken(url, {cache: "no-store"});
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
            const res = await fetchWithToken(`${baseUrl}/tasks/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newTodo),
            });
            if (res.status === 401) {
                return 'Permission denied';
            }
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
            const res = await fetchWithToken(`${baseUrl}/tasks/edit`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(todo),
            });
            if (res.status === 401) {
                return 'Permission denied';
            }
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
            const res = await fetchWithToken(`${baseUrl}/tasks/${taskId}`, {method: "DELETE"});
            if (res.status === 401) {
                return 'Permission denied';
            }
            if (!res.ok) {
                throw new Error('Failed to delete todo');
            }
        } catch (error) {
            throw error;
        }
    }
    return await retry(deleteTodoAsync)
};

export const getUsers = async () => {
    const getUsersAsync = async () => {
        try {
            const url = `${baseUrl}/users`;
            const res = await fetchWithToken(url, {cache: "no-store"});
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }

            return res.json();
        } catch (error) {
            throw error;
        }
    }
    return await retry(getUsersAsync)
};

export const getUser = async () => {
    const getUserAsync = async () => {
        try {
            const url = `${baseUrl}/user`;
            const res = await fetchWithToken(url, {cache: "no-store"});
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }

            return res.json();
        } catch (error) {
            throw error;
        }
    }
    return await retry(getUserAsync)
};

export const handleAddUser = async (newUser) => {
    const addUserAsync = async () => {
        try {
            const res = await fetchWithToken(`${baseUrl}/users/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newUser),
            });
            if (res.status === 401) {
                return 'Permission denied';
            }
            if (!res.ok) {
                throw new Error('Failed to add user');
            }
            return await res.json();
        } catch (error) {
            throw error;
        }
    }
    return await retry(addUserAsync)
};

export const handleEditUser = async (user) => {
    const editUserAsync = async () => {
        try {
            const res = await fetchWithToken(`${baseUrl}/users/edit`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(user),
            });
            if (res.status === 401) {
                return 'Permission denied';
            }
            if (!res.ok) {
                throw new Error('Failed to edit user');
            }
            return await res.json();
        } catch (error) {
            throw error;
        }
    }
    return await retry(editUserAsync)
};

export const handleDeleteUser = async (userId) => {
    const deleteUserAsync = async () => {
        try {
            const res = await fetchWithToken(`${baseUrl}/users/${userId}`, {method: "DELETE"});
            if (res.status === 401) {
                return 'Permission denied';
            }
            if (!res.ok) {
                throw new Error('Failed to delete todo');
            }
        } catch (error) {
            throw error;
        }
    }
    return await retry(deleteUserAsync)
};
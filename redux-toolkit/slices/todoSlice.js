import { createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice({
    name: 'todos',
    initialState: [],
    reducers: {
        setTodos(state, action) {
            return action.payload;
        },
        addTodo(state, action) {
            state.push(action.payload);
        },
        editTodo(state, action) {
            const index = state.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) {
                state[index] = action.payload;
            }
        },
        deleteTodo(state, action) {
            return state.filter(todo => todo.id !== action.payload);
        },
    },
});

export const { setTodos, addTodo, editTodo, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;

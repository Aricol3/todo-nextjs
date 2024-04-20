import {getAllTodos} from "../services/api";
import App from "./App";

export default async function Home() {
    let todosList=[];
    try {
        todosList = await getAllTodos({page:1, limit:20, time:"DESC"});
    } catch (error) {
        console.error('Error fetching todos:', error.message);
    }

    return (
        <>
            <App taskList={todosList}/>
        </>
    );
}




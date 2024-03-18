import {getAllTodos} from "../services/api";
import App from "./App";

export default async function Home() {
    const todosList = await getAllTodos();

    return (
        <App taskList={todosList}/>
    );
}




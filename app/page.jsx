import {getAllTodos} from "../services/api";
import TodoTable from "../components/TodoTable";

export default async function Home() {
    const todosList = await getAllTodos();
    console.log(todosList)

    return (
        <>
            <TodoTable tasks={todosList}/>
        </>
    );
}

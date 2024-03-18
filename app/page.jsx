import {getAllTodos} from "../services/api";
import TodoTable from "../components/TodoTable";

export default async function Home() {
    const todosList = await getAllTodos();

    return (
        <>
            <TodoTable tasks={todosList}/>
        </>
    );
}

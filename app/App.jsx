"use client"

import {ThemeProvider as NextThemesProvider} from "next-themes";
import TodoTable from "../components/TodoTable";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeSwitcher} from "../components/ThemeSwitcher";
import {useEffect, useState} from "react";
import {Provider} from "react-redux";
import store from "../redux-toolkit/store";
import io from 'socket.io-client';


const socket = io('http://localhost:3002');

const App = ({taskList}) => {
    const [selectedColor, setSelectedColor] = useState("secondary");
    const [tasks, setTasks] = useState(taskList);

    useEffect(() => {
        setTasks(taskList)
    }, [taskList])

    useEffect(() => {
        socket.on('newTodo', newTodo => {
            console.log('Received new Todo:', newTodo);
            setTasks(prevTaskList => [...prevTaskList, newTodo]);
            console.log(tasks);
        });

        return () => {
            socket.off();
        };
    }, [tasks]);

    return (
        <Provider store={store}>
            <NextUIProvider>
                <NextThemesProvider attribute="class" defaultTheme="light">
                    <div className="flex justify-end mt-3">
                        <ThemeSwitcher selectedColor={selectedColor}/>
                    </div>
                    {tasks &&
                        <TodoTable tasks={tasks} selectedColor={selectedColor} setSelectedColor={setSelectedColor}/>}
                </NextThemesProvider>
            </NextUIProvider>
        </Provider>
    )
}
export default App;
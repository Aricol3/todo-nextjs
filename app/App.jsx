"use client"

import {ThemeProvider as NextThemesProvider} from "next-themes";
import TodoTable from "../components/TodoTable";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeSwitcher} from "../components/ThemeSwitcher";
import {useState} from "react";

const App = ({taskList}) => {
    const [selectedColor, setSelectedColor] = useState("secondary");

    return (<NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
            <div className="flex justify-end mt-3">
                <ThemeSwitcher selectedColor={selectedColor}/>
            </div>
            <TodoTable tasks={taskList} selectedColor={selectedColor} setSelectedColor={setSelectedColor}/>
        </NextThemesProvider>
    </NextUIProvider>)
}
export default App;
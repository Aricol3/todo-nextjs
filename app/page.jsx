"use client"

import {getAllTodos} from "../services/api";
import App from "./App";
import {useEffect, useState} from "react";
import {router} from "next/client";
import {useRouter} from "next/navigation";

export default function Home() {
    const [todosList, setTodosList] = useState([]);
    const router = useRouter();

    useEffect(()=>{
        if(localStorage.getItem("token")) {
            getTodos()
        }
        else{
            router.push('/login')
        }
    },[])

    const getTodos = async () => {
        try {
            const todos = await getAllTodos({ page: 1, limit: 20, time: "DESC" });
            setTodosList(todos);
        } catch (error) {
            console.error('Error fetching todos:', error.message);
        }
    }

    return (
        <>
            <App taskList={todosList} />
        </>
    );
}
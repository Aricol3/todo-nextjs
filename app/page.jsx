'use client'

import {getAllTodos, getUser} from "../services/api";
import App from "./App";
import React, {useEffect, useState} from "react";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import {Button} from "@nextui-org/react";
import {PlusIcon} from "../components/PlusIcon";

export default function Home() {
    const [todosList, setTodosList] = useState([]);
    const [currentUser, setCurrentUser] = useState({});
    const router = useRouter();

    useEffect(()=>{
        if(localStorage.getItem("token")) {
            getUserRole();
            getTodos();
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

    const getUserRole = async () => {
        try {
            const user = await getUser();
            setCurrentUser(user);
            console.log("USER IS???ASD", user)
        } catch (error) {
            console.error('Error fetching user:', error.message);
        }
    }


    return (
        <>
            <App taskList={todosList}/>
            {currentUser.role === "admin" && <div className="flex justify-between gap-3 m-3">
                <div className="flex gap-3">
                    <Button onClick={() => router.push('/login')}>
                        Login
                    </Button>
                    <Button onClick={() => router.push('/register')}>
                        Register
                    </Button>
                    <Button onClick={() => router.push('/admin')}>
                        Go to Admin Dashboard
                    </Button>
                </div>
            </div>}
        </>
    );
}
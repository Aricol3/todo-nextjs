'use client'

import React, { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {authUser, getUser, registerUser} from "../../services/api";
import {toast, ToastContainer} from "react-toastify";

export default function LoginPage() {
    const router = useRouter()

    async function handleSubmit(event) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')
        console.log(email,password)
        const res = await registerUser(email,password)
        console.log("?!@#",res)
        if (res.ok) {
            router.push('./');
        } else {
            toast(res.error);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}
                  style={{maxWidth: '300px', margin: 'auto', textAlign: 'center', paddingTop: '50px'}}>
                <h2>Create new account</h2>
                <div style={{marginBottom: '20px'}}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                        required
                    />
                </div>
                <div style={{marginBottom: '20px'}}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                        required
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '14px 20px',
                        borderRadius: '5px',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer'
                    }}
                >
                    Register
                </button>
            </form>

            <ToastContainer/>
        </>
    )
}
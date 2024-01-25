import React from "react";
import {Form, redirect, useLoaderData} from 'react-router-dom'

export async function action({request}){

    const formData = await request.formData();

    const userData = {
        email: formData.get('email'),
        password: formData.get('password')
    }
    
    try{
        const res = await fetch(`${import.meta.env.VITE_REACT_API_SERVER_URL}/login`, {
            method:"post",
            credentials:'include',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(userData)
        })

        const data = await res.json();
    
        if(data.success){
            return redirect("/dashboard");
        } else {
            
            switch(res.status){
                case 400:
                case 401:
                case 402:
                    return redirect("/login?message=Invalid Email or Password");
                default:
                    return redirect("/login?message=Internal Server Error");
            }
        }

    } catch (err){
        return redirect("/login?message=Internal Server Error");
    }

    return null;
}

export function loader({request}){
    return new URL(request.url).searchParams.get("message");
}

export default function Login(){

    const message = useLoaderData();

    return (
        <main className="hero">
            <h1>Login Form</h1>
            <Form method='post'>
                <div className="form">
                    <input type='email' id='email' name='email' placeholder="Email"/>
                    <input type='password' id='password' name='password' placeholder="Password"/>
                </div>
                <button className="button" type='submit'>Login</button>
            </Form>
            { message && <h3>{message}</h3>}
        </main>
    )
}
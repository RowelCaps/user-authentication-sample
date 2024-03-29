import React from 'react';
import {Form, redirect, useLoaderData} from 'react-router-dom'

export async function action({request}){
    
    const formData = await request.formData();

    const  user = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
    };

    if(user.password != formData.get("confirmPassword")){
        return redirect(`/user-authentication-client/register?message=Password does not match!`);
    }

    try{
        const res = await fetch(`${import.meta.env.VITE_REACT_API_SERVER_URL}/register`, {
            method:"post",
            credentials: 'include',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(user)
        });

        const data = await res.json(); 

        console.log(data.message);

        if(data.success){
            return redirect('/user-authentication-client/dashboard');
        }
        
        return redirect(`/user-authentication-client/register?message=${data.message}`);

    } catch(err){
        console.log(err);
        return redirect(`/user-authentication-client/register?message=Internal Server Error`);
    }
}

export function loader({request}){
    return new URL(request.url).searchParams.get("message");
}

export default function Register(){

    const message = useLoaderData();

    return(
        <main className='hero'>
            <h1>Register Form</h1>
            <Form method='post'>
                <div className='form'>
                    <input type='text' id='name' name='name' placeholder='Name' required/>
                    <input type='email' id='email' name='email' placeholder='Email' required/>
                    <input type='password' id='password' name='password' placeholder='Password' required/>
                    <input type='password' id='confirmPassword' name='confirmPassword' placeholder='Confirm Password' required/>
                </div>
                <button className='button' type='submit'>SignUp</button>
            </Form>
            {message && <h3>{message}</h3>}
        </main>
    )
}
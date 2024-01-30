import React from 'react';
import {redirect, useLoaderData, useNavigate} from 'react-router-dom'
import { isAuthenticated } from '../utility';

export async function loader(){
    
    console.log("dashboard enter");
    const clientAuthenticated = await isAuthenticated();

    if(!clientAuthenticated){
        return redirect("/user-authentication-client/login");
    }
    try{
        const res = await fetch(`${import.meta.env.VITE_REACT_API_SERVER_URL}/user`, {
            method:'get',
            credentials:'include',
            headers: {'content-type': 'application/json'}
        });

        const data = await res.json();
    
        if(data.success){
            return data.userData;
        } else {
            console.log("oh no");
            return null;
        }
    } catch(err){
        console.log(err);
        return redirect("/user-authentication-client/login");
    }
}

export default function Dashboard(){

    const [isLoggingOut, setLoggintOut] = React.useState(false);

    const navigate = useNavigate();
    const userData = useLoaderData()

    async function logoutUser(){
        console.log("logging out");
        setLoggintOut(true);

        const res = await fetch(`${import.meta.env.VITE_REACT_API_SERVER_URL}/logout`, {
            method: 'post',
            credentials: 'include',
            headers: {'content-type': 'application/json'}
        });
        navigate('/login');
    }

    return(
        <main className='hero'>
            <h1 className='header-text'> Welcome {userData && userData.name} ! </h1>
            <button className='button' onClick={logoutUser} disabled={isLoggingOut}>Logout</button>
        </main>
    )
}
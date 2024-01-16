import React from 'react';
import {redirect, useLoaderData, useNavigate} from 'react-router-dom'
import { isAuthenticated } from '../utility';

export async function loader(){
    console.log("lodersss");
    const clientAuthenticated = await isAuthenticated();

    if(!clientAuthenticated){
        return redirect("/login");
    }
    try{
        const res = await fetch('http://localhost:3000/user', {
            method:'get',
            credentials:'include',
            headers: {'content-type': 'application/json'}
        });

        const data = await res.json();
    
        if(data.success){
            return data.userData;
        } else {
            console.log("oh no");
            return false;
        }
    } catch(err){
        console.log(err);
        return redirect("/login");
    }
}

export default function Dashboard(){

    const [isLoggingOut, setLoggintOut] = React.useState(false);

    const navigate = useNavigate();
    const userData = useLoaderData()

    async function logoutUser(){
        console.log("logging out");
        setLoggintOut(true);

        const res = await fetch('http://localhost:3000/logout', {
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
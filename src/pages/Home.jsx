import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Home(){
    return(
        <main className='hero'>            
            <h1 className='header-text mp-0'> User Authentication sample </h1>
            <h4> Made by Rowel Capulong</h4>

            <div>
                <h2 className='feature-text'>Feature: </h2>
                <ul>
                    <li>Safely store user data using PostgreSQL</li>
                    <li>Create a seamless user registration process</li>
                    <li>Ensure security through protected routes</li>
                    <li>Authenticate user based on stored database information</li>
                    <li>Implement secure user authentication using JWTs</li>
                    <li>Enchance security through password and refresh token hashing</li>
                    <li>Store tokens on cookies for efficient and secure authentication</li>
                </ul>
            </div>
            <div className='horizontal-buttons'>
                <NavLink to='login'> Login </NavLink>
                <NavLink to='register'> Signup </NavLink>
            </div>
        </main>
    )
}
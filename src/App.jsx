import { useState } from 'react'
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Routes
} from 'react-router-dom';

import Home from './pages/Home';
import Login, {action as loginAction, loader as loginLoader} from './pages/Login';
import Register, {action as registerAction, loader as registerLoader} from './pages/Register';
import Dashboard, {loader as dashBoardLoader} from './pages/Dashboard';

async function authenticationLoader() {

  const rest = await fetch()

}

const router = createBrowserRouter(createRoutesFromElements(
  <Route>
    <Route index element={<Home/>} />
    <Route 
      path='login' 
      loader={loginLoader}
      element={<Login/>} 
      action={loginAction}/>
    <Route 
      path='register'
      loader={registerLoader}
      action={registerAction}
      element={<Register/>} 
      />
    <Route
      path='dashboard'
      element={<Dashboard/>}
      loader={dashBoardLoader}
    />
  </Route>
))

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App

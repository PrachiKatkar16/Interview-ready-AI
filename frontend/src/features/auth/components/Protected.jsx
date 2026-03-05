import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router'


function Protected({children}) {
    const {loading,user}=useAuth()

    if(loading){
        return <div>Loading...</div>
    }
    if(!user){
        return <Navigate to={"/login"}/>
    }
    return children

}
export default Protected

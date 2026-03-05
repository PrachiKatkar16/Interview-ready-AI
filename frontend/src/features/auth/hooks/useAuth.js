import {useContext,useEffect} from 'react'
import { AuthContext } from '../auth.context.jsx'
import { login, register,logout,getMe } from '../services/auth.api.js'


export const useAuth=()=>{
    const context=useContext(AuthContext)
    const {user,setUser,loading,setLoading}=context

    const  handleLogin=async({email,password})=>{
        try{
            setLoading(true)
            const data=await login({email,password})
            setUser(data.user)
        }
        catch(error){

        }
        finally{
            setLoading(false)
        }
    }

    const handleRegister=async({username,email,password})=>{
        try{
            setLoading(true)
            const data=await register({username,email,password})
            setUser(data.user)
        }
        catch(error){

        }
        finally{
            setLoading(false)
        }
        
    }
    const handleLogout=async()=>{
        try{
            setLoading(true)
            const data=await logout()
            setUser(null)
        }
        catch(error){

        }
        finally{
            setLoading(false)
        } 
    }

     useEffect(()=>{
        const getAndSetUser=async()=>{
            const data=await getMe()
            setUser(data.user)
            setLoading(false)
        }
        getAndSetUser()
    },[])
    return {user,loading,handleLogin,handleRegister,handleLogout}
}
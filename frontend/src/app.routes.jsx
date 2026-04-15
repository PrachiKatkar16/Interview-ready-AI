import {createBrowserRouter} from 'react-router'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Home from './features/interview/pages/Home'
import Protected from './features/auth/components/Protected'
import Interview from './features/interview/pages/Interview'
import InterviewSession from './features/interview/pages/InterviewSession'




export const router = createBrowserRouter([
    {
        path:'/login',
        element:<Login/>

    },
    {
        path:'/register',
        element:<Register/>
    },
    {
        path:'/',
        element:<Protected><Home/></Protected>
    },
    {
        path: "/interview",
        element: <Protected><InterviewSession /></Protected>
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    }
])
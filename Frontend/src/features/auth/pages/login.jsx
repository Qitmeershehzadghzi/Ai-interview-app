import React,{useState} from 'react'
import '../../auth/auth.form.scss'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router'
function login() {
    const {handleLogin,loading} =useAuth()
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const navigate = useNavigate()
    const handleSubmit =async(e)=>{
        e.preventDefault()
        await handleLogin({email,password})
        navigate('/')
    }
    if(loading){
    return (<main><h1>loading......</h1></main>)
    }
  return (
 <>
 <main>
    <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                onChange={(e)=>setEmail(e.target.value)}
                type="email" id="email" name="email" placeholder='enter your email address' required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input 
                onChange={(e)=>setPassword(e.target.value)}
                type="password" id="password" name="password" placeholder='enter your password' required />
            </div>
            <button className='button primary-button' type="submit">Login</button>
        </form>
                <p>Don't have an account?<Link to={'/register'}>Register</Link></p>

    </div>
</main> 
 </>
)
}

export default login
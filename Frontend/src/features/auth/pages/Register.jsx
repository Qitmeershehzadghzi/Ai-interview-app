import React,{useState} from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
function Register() {
    const [userName,setUserName] =useState('')
const [email,setEmail] = useState('')
const [password,setPassword] = useState('')

const {handleRegister,loading} =useAuth()
const navigate = useNavigate()

      const handleSubmit =async(e)=>{
        e.preventDefault()
        await handleRegister({userName,email,password})
        navigate('/')
    }
      if(loading){
    return (<main><h1>loading......</h1></main>)
    }
  return (
    <>
    <main>
    <div className="form-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="username">userName:</label>
                <input
                onChange={(e)=>{setUserName(e.target.value)}}
                type="text" id="username" name="username" placeholder='enter username' required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input 
                onChange={(e)=>{setEmail(e.target.value)}}
                 type="email" id="email" name="email" placeholder='enter your email address' required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input 
                 onChange={(e)=>{setPassword(e.target.value)}}
                type="password" id="password" name="password" placeholder='enter your password' required />
            </div>
            <button className='button primary-button' type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to={'/login'}>Login</Link></p>
    </div>
</main> 
    
    </>
  )
}

export default Register
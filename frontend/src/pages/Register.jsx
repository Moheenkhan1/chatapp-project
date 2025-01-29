import React, { useState , useContext } from 'react';
import Squares from '../components/SquaresBG';
import StarBorder from '../components/StarBorderButton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    

    const response = await axios.post('http://localhost:5000/user/register', formData , { withCredentials: true })

    if(response.status === 200){
      navigate('/login')
    }

    if(response.status === 400 || response.status === 401 || response.status === 500){
      alert(response.data.message)
    }

  };

  return (

    <>
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-[#060606] overflow-hidden ">
      <div className="absolute inset-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='#fff'
          hoverFillColor='cyan'
        />
      </div>
      <div className="max-w-[40%] w-full space-y-8 p-8 bg-[#0D0D0D] rounded-lg shadow-md z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Chat App Project
          </h2>
        </div>
        <form className="mt-8 space-y-6 " onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4 ">
            <div>
              <label htmlFor="username" className="block ml-[8.1rem] text-sm font-medium text-white">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none ml-[8.1rem] rounded-md relative block w-[60%] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block ml-[8.1rem] text-sm font-medium text-white">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md ml-[8.1rem] relative block w-[60%] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block ml-[8.1rem] text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md ml-[8.1rem] relative block w-[60%] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block ml-[8.1rem] text-sm font-medium text-white">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-md ml-[8.1rem] relative block w-[60%] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
          <StarBorder
            as="button"
            className="custom-class ml-[12.2rem] w-[40%] "
            color="cyan"
            speed="5s"
          >
            Register
          </StarBorder>
          </div>
        </form>
      </div>
    </div>
    </>
    
  );
}

export default Register;

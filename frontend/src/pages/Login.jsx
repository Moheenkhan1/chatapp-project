import React, { useState, useContext } from 'react';
import Squares from '../components/SquaresBG';
import StarBorder from '../components/StarBorderButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../Contexts/UserContext';
import { Link } from 'react-router-dom';
import { ToastContainer, toast , Bounce } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/user/login",
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("User authenticated:", response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // setUser(response.data.user);
        toast.success('Login Successfull.!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          });
        navigate("/");
      }
    } catch (error) {
      const mesg = error.response.data.message
      toast.error(mesg, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
        });
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-[#060606] overflow-hidden">
      <div className="absolute inset-0">
        <Squares speed={0.5} squareSize={40} direction="diagonal" borderColor="#fff" hoverFillColor="cyan" />
      </div>
      <div className="max-w-[40%] w-full space-y-8 p-8 bg-[#0D0D0D] rounded-lg shadow-md z-10">
        <h2 className="text-3xl font-extrabold text-white text-center">Chat App Project</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="text-center flex flex-col">
            <StarBorder as="button" color="cyan" speed="5s">Login</StarBorder>

            <Link to={'/register'} className='text-white text-xl' >New User.? Register Here</Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;

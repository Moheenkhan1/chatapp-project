import React, { useState, useContext } from 'react';
import Squares from '../components/SquaresBG';
import StarBorder from '../components/StarBorderButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../Contexts/UserContext';
import { Link } from 'react-router-dom';
import { ToastContainer, toast , Bounce } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import BlobCursor from '../components/Blobcursor';


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
    <div className="h-screen w-screen flex items-center justify-center bg-[#E8E8E8] overflow-hidden">
      <BlobCursor className=' absolute inset-0 ' />
      <div className="w-[30%] max-sm:w-[70%] h-[50%] max-sm:h-[45%] space-y-8 p-8 bg-[#FFFFFF] rounded-lg  z-10 shadow-[0_45px_45px_rgba(0,0,0,0.25)] absolute ">
      <div className="flex items-center  ml-[6.5rem] max-sm:ml-0 max-sm:mt-[-1.5rem]  " >
          <div className="pulse animate-pulseCustom mt-3 h-[2rem] max-sm:h-[1.5rem] w-[2rem] max-sm:w-[1.5rem] rounded-full bg-[#4169E1] "></div>
            <h2 className="mt-3 ml-[1.5rem] max-sm:ml-3 text-3xl max-sm:text-xl font-extrabold max-sm:font-bold text-[#4169E1]">
              Chat App Project
            </h2>
          </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 mt-10 max-sm:mt-0 max-sm:mt-3 ">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder='username'
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder='password'
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-col text-center" >
              <button
                className="custom-class shadow-lg shadow-indigo-500/50 ml-[9.2rem] max-sm:ml-[3.7rem] mt-9 max-sm:mt-[-1rem] w-[40%]  p-[10px] rounded-[10px] text-[#fff] text-[1.2rem] max-sm:text-[0.8rem] bg-[royalblue] hover:bg-[#385AC2]  "
              >
                Login
              </button>

              <Link to={'/login'} className=" text-xl max-sm:text-sm mt-5 max-sm:mt-3 " > New here.? <span className=" text-[indigo] underline " >Register here.!</span>  </Link>
            </div>

        </form>
      </div>
    </div>
  );
}

export default Login;

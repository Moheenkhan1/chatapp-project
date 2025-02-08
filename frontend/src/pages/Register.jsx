import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from 'react-router-dom'
import { ToastContainer, toast , Bounce } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import BlobCursor from '../components/Blobcursor'

function Register() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Access env variable

  const [file, setFile] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // checks if password and confirm password in the form are same
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored", // You can change this to "light" if needed
      });
    
      return;
    }

    // adds all the inputs to formdata
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (file) formData.append("file", file);

    try{
      const response = await axios.post(
        `${API_BASE_URL}/user/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
  
      // display successfull message and redirects to Login is registration is successfull
      if (response.status === 200) {
        toast.success('Register Successfull.! Login Now', {
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
        navigate("/login");
      }

    }catch(error){

      // if block to display any of the errors like users already exists etc
      if (
        error.response.status === 400 ||
        error.response.status === 401 ||
        error.response.status === 500
      ) {
        const message=error.response.data.message
        toast.error(message, {
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

    }




  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <>
      <div className="max-h-screen max-w-screen flex items-center justify-center bg-[#E8E8E8]">
      <BlobCursor className=' absolute inset-0 ' />
        <div className="w-[40%] max-sm:w-[75%] h:[50%] max-sm:h-[60%]  space-y-8 p-8 bg-[#FFFFFF] rounded-lg  z-10 shadow-[0_45px_45px_rgba(0,0,0,0.25)] absolute top-[10rem] max-sm:top-[7rem] ">
          <div className="flex items-center  ml-[10rem] max-sm:ml-0 max-sm:mt-[-1rem] " >
            <div className="pulse animate-pulseCustom mt-3 max-sm:mt-1 h-[2rem] max-sm:h-[1.5rem] w-[2rem] max-sm:w-[1.5rem] rounded-full bg-[#4169E1] "></div>
            <h2 className="mt-3 max-sm:mt-1 ml-[1.5rem] max-sm:ml-[0.8rem] text-3xl max-sm:text-xl font-extrabold text-[#4169E1]">
              Chat App Project
            </h2>
          </div>
          <form className="mt-8 max-sm:mt-2 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                <label
                  htmlFor="fileInput"
                  className="max-sm:ml-[6rem] cursor-pointer flex flex-col max-sm:flex-row items-center"
                >
                  <div className="max-sm:ml-[-8rem] w-20 max-sm:w-15 h-20 max-sm:h-15 bg-gray-300 ring shadow-xl shadow-indigo-500/50 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Profile Preview"
                        className="rounded-full object-cover w-full h-full"
                      />
                    ) : (
                      <span>Upload</span>
                    )}
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="max-sm:ml-6 text-[#4169E1] font-bold underline mt-2">Upload Photo</span>
                </label>
              </div>

              <div className="flex max-sm:flex-row items-center gap-x-4" >
              {/* Username */}
              <div  >
                <label
                  htmlFor="username"
                  className="block ml-[8.1rem] max-sm:ml-0 text-sm font-medium text-black max-sm:hidden "
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none ml-[8.1rem] max-sm:ml-0 rounded-md relative block w-[60%] max-sm:w-[6.5rem] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block max-sm:hidden ml-[0.5rem] max-sm:ml-0 text-sm font-medium text-black"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md ml-[0.5rem] max-sm:ml-[-0.7rem] relative block  w-[87%] max-sm:w-[7rem] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
              </div>
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block max-sm:hidden ml-[8.1rem] text-sm font-medium text-black"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md ml-[8.1rem] max-sm:ml-0 relative block w-[60%] max-sm:w-[107%] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block max-sm:hidden ml-[8.1rem] text-sm font-medium text-black"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-md ml-[8.1rem] max-sm:ml-0 relative block w-[60%] max-sm:w-[107%] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col text-center" >
              <button
                className="max-sm:mt-[-1rem] custom-class shadow-lg shadow-indigo-500/50 ml-[12.2rem] max-sm:ml-[3.5rem] w-[40%] max-sm:w-[50%]  p-[10px] rounded-[10px] text-[#fff] text-[1.2rem] max-sm:text-[0.8rem] bg-[royalblue] hover:bg-[#385AC2]  "
              >
                Register
              </button>

              <Link to={'/login'} className=" text-xl max-sm:text-sm mt-2 " > Already a User.? <span className=" text-[indigo] underline " >Login here.!</span>  </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;

import { Routes, Route, useLocation, useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaTimes } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { useForm } from 'react-hook-form';
import axios from "axios"


const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [response, setResponse] = useState("")
  const {userId} = useParams()

  const {
      register,
      handleSubmit,
      getValues,
      formState:{errors}
  } = useForm({
      mode: "onChange"
  })

  const onSubmit = async (data)=>{
    setIsLoading(true)
    setResponse("")
    try {
          const newData = {...data, userId: userId}
          const res = await axios.post("/api-v1/user/change-password", newData)
          if(res.data.success){
              setErrorMsg(res.data.success)
              setResponse(res.data.message)

              setTimeout(() => {
                  window.location.href = "http://localhost:5173/auth/account"
              }, 2000);
          }else{
              setErrorMsg(res.data.success)
              setResponse(res.data.message)
          }
          setIsLoading(false)
        } catch (error) {
          console.log(error)
          setErrorMsg(true)
          setResponse(error.message)
          setIsLoading(false)
      }
  }


return (
  <div className='w-full h-screen flex flex-col items-center
  justify-center p-5 bg-[#edf0f3]'> 
      <div className='md:w-[400px] w-full h-fit bg-white rounded-lg 
      md:py-4 md:px-4 px-10 py-5 flex items-center flex-col gap-3 shadow-md'>
        
            <div className="w-full flex items-center flex-col gap-4">
              <h1 className="text-xl font-bold text-black">Reset Password</h1>

              {response && (
                  <p className={`py-2 px-4 ${!errorMsg
                      ? 'text-[#f64949fe]' : 'text-[#2ba150fe]'}`}>
                      {response}
                  </p>
              )}

              <form 
              onSubmit={handleSubmit(onSubmit)}
              className='w-full mt-8 flex flex-col gap-2'>
                <div className="flex flex-col gap-2 w-full items-start">
                    <label>New Password</label>
                  <input
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  className="h-[50px] w-full outline-none border-[1px] border-[#edf0f3] 
                  rounded-md p-2 text-black focus:border-[2px] transition-all duration-300
                  ease-in-out"
                  {...register("password",{
                      required:"This field is required.",
                  })}
                  />
                  {errors?.password &&
                    <span className="text-sm py-1 text-[#f64949fe]">
                      {errors?.password ? errors?.password.message : ""}
                    </span>
                  }
                </div>
                <div className="flex flex-col gap-2 w-full items-start">
                    <label>Confirm New Password</label>
                    <input
                    type="password"
                    name="cpassword"
                    placeholder="Enter password"
                    className="h-[50px] w-full outline-none border-[1px] border-[#edf0f3] 
                    rounded-md p-2 text-black focus:border-[2px] transition-all duration-300
                    ease-in-out"
                    {...register("cpassword",{
                        validate:(val)=>{
                            const {password} = getValues()
                            return val === password || "Passwords do not match"
                        }
                    })}
                    />
                    {errors?.cpassword &&
                      <span className="text-sm py-1 text-[#f64949fe]">
                        {errors?.cpassword ? errors?.cpassword.message : ""}
                      </span>
                    }
                </div>

                  {isLoading ? (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className=" text-blue animate-spin 
                      rounded-full h-8 w-8 border-t-2 border-blue-500 
                      border-opacity-50"></div>
                      <div className=" text-blue animate-spin 
                      rounded-full h-8 w-8 border-t-2 border-blue-500 
                      border-opacity-50"></div>
                      <div className=" text-blue animate-spin 
                      rounded-full h-8 w-8 border-t-2 border-blue-500 
                      border-opacity-50"></div>
                  </div>
                  ):(
                    <button
                    type="Submit"
                    className="bg-blue-500 py-2 px-8 rounded-md text-white 
                    outline-none text-md font-semibold flex items-center 
                    justify-center mt-6"
                    >
                      Submit
                    </button>
                  )}

              </form>
            </div>

      </div>
  </div>
)
}

const Verify = () => {
  const [status, setStatus] = useState("")
  const [message, setMessage] = useState("")

  const {token,userId} = useParams()

  const handleVerify = async ()=>{
      try {
          const res = await axios.get(`/api-v1/user/verify/${userId}/${token}`)
          setStatus(res.data.success)
          setMessage(res.data.message)
      } catch (error) {
          console.log(error)
          setMessage("Error, Try again")
      }
  }

  useEffect(()=>{
      handleVerify()
  },[token,userId])


return (
  <div className='w-full h-screen flex flex-col items-center
  justify-center p-5 bg-[#edf0f3]'> 
      <div className='w-[400px] h-fit bg-white rounded-lg 
      p-4 flex items-center flex-col gap-3 shadow-md'>
          <h4 
          className='text-lg text-black font-bold'>
              {message}
          </h4>
          <span 
          className={`flex items-center justify-center ${!status
          ? `bg-[#f64949fe]` : `bg-[#2ba150fe]`}
          p-2 rounded-lg text-white`}>
              {!status ?(
                  <FaTimes size={25}/>
              ):(
                  <MdOutlineDone size={25}/>
              )}
          </span>
          <Link 
              to="http://localhost:5173/auth/account"
              className='bg-blue-500 rounded-lg py-2 px-3 text-white mt-4'
          >
              {!status ? "Go back to Signup" : "Proceed to login"}
          </Link>
      </div>
  </div>
)
}

const Verified = ()=>{

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const status = queryParams.get("status")
  const message = queryParams.get("message")

  return(
    <div className='w-full h-screen flex flex-col items-center
    justify-center p-5 bg-[#edf0f3]'> 
      <div className='w-[400px] h-fit bg-white rounded-lg 
      p-4 flex items-center flex-col gap-3 shadow-md'>
          <h4 
          className='text-lg text-black font-bold'>
              {message}
          </h4>
          <span 
          className={`flex items-center justify-center ${status === "error"
          ? `bg-[#f64949fe]` : `bg-[#2ba150fe]`}
          p-2 rounded-lg text-white`}>
              {status === "error" ?(
                  <FaTimes size={25}/>
              ):(
                  <MdOutlineDone size={25}/>
              )}
          </span>
          <Link 
              to="http://localhost:5173/auth/account"
              className='bg-blue-500 rounded-lg py-2 px-3 text-white mt-4'
          >
              {status === "error" ? "Go back to Signup" : "Proceed to login"}
          </Link>
      </div>
    </div>
  )
}

const VerifyPasswordLink = () => {
  const {_id,token} = useParams()
  const navigate = useNavigate()


  const handleVerify = async ()=>{
      try {
          const res = await axios.get(`/api-v1/user/password-link/${_id}/${token}`)
          if(res?.data.status === "success"){
            const {id} = res.data
            navigate(`/changePassword/${id}`)
          }else{
            const {status, message} = res?.data
            navigate(`/verified?status=${status}&message=${message}`)
          }
      } catch (error) {
          console.log(error)
          navigate(`/verified?status=error&message=${error.message}`)
      }
  }

  useEffect(()=>{
      handleVerify()
  },[token,_id])


return (
  <div className='w-full h-screen flex flex-col items-center
  justify-center p-5 bg-[#edf0f3]'> 
      <div className='w-[400px] h-fit bg-white rounded-lg 
      p-4 flex items-center justify-center flex-col gap-3 shadow-md'>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className=" text-blue animate-spin 
          rounded-full h-8 w-8 border-t-2 border-blue-500 
          border-opacity-50"></div>
          <div className=" text-blue animate-spin 
          rounded-full h-8 w-8 border-t-2 border-blue-500 
          border-opacity-50"></div>
          <div className=" text-blue animate-spin 
          rounded-full h-8 w-8 border-t-2 border-blue-500 
          border-opacity-50"></div>
        </div>
    </div>
  </div>
)
}

function App() {
  
  return (
      <div>
        <Routes>
          <Route path="/verify/:userId/:token" element={<Verify/>}/>
          <Route path="/changePassword/:userId" element={<ResetPassword/>}/>
          <Route path="/verified" element={<Verified/>}/>
          <Route path="/password-link/:_id/:token" element={<VerifyPasswordLink/>}/>
        </Routes>
      </div>
  );
}

export default App;

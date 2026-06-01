import React from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
function Auth({isModel = false}) {
    const dispatch = useDispatch()

    const handleGoogleAuth = async () => {
        try {
            const response = await signInWithPopup(auth,provider)
            let User = response.user
           let name = User.displayName
let email = User.email
let firebaseUid = User.uid

const result = await axios.post(
 ServerUrl + "/api/auth/google",
 { name, email, firebaseUid },
 { withCredentials: true }
)
            dispatch(setUserData(result.data))
            


            
        } catch (error) {
            console.log(error)
              dispatch(setUserData(null))
        }
    }
  return (
    <div className={`
      w-full 
      ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}
    `}>
        <motion.div 
        initial={{opacity:0 , y:-40}} 
        animate={{opacity:1 , y:0}} 
        transition={{duration:1.05}}
        className={`
        w-full 
        ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
        bg-white shadow-2xl border border-gray-200
      `}>
            <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-[#213448] text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>

                    <h2 className='font-semibold text-lg tracking-wide text-[#213448]'>
                        IntelliPrep<span className="text-[#547792]">.AI</span>
                    </h2>
                </div>

        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4 text-[#213448]'>
            Unlock 
         <span className='bg-[#547792]/20 text-[#547792] px-3 py-1 rounded-full inline-flex items-center gap-2'>
            <IoSparkles size={16}/>
            AI-Powered Interviews
        </span>
        </h1>

            <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                Sign in to access personalized AI interviews, monitor your progress, and gain actionable insights to improve faster.
            </p>


            <motion.button 
                onClick={handleGoogleAuth}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className='w-full flex items-center justify-center gap-3 py-3 bg-[#213448] text-white rounded-full shadow-md hover:bg-[#547792] transition'
                >
                    <FcGoogle size={20} />
                    Continue with Google to Get Started

   
            </motion.button>
        </motion.div>

      
    </div>
  )
}

export default Auth

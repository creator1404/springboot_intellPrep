import React from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
} from "react-icons/fa";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
function Step1SetUp({ onStart }) {
    const {userData}= useSelector((state)=>state.user)
    const dispatch = useDispatch()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);


    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            console.log(result.data)

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);

            setAnalyzing(false);

        } catch (error) {
            console.log(error)
            setAnalyzing(false);
        }
    }

    const handleStart = async () => {
        setLoading(true)
        try {
           const result = await axios.post(ServerUrl + "/api/interview/generate-questions" , {role, experience, mode , resumeText, projects, skills } , {withCredentials:true}) 
           console.log(result.data)
           if(userData){
            dispatch(setUserData({...userData , credits:result.data.creditsLeft}))
           }
           setLoading(false)
           onStart(result.data)

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4'>

            <div className='w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>

                <motion.div
  initial={{ x: -80, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.7 }}
  className='relative bg-gradient-to-br from-[#E0F2FE] to-[#94B4C1]/40 p-12 flex flex-col justify-center'>

  {/* HEADING */}
  <h2 className="text-4xl font-bold text-[#213448] mb-6">
    Elevate Your Interview Skills with AI
  </h2>

  {/* DESCRIPTION */}
  <p className="text-[#547792] mb-10 leading-relaxed">
    Experience next-generation interview preparation with intelligent AI simulations. 
    Build confidence, improve communication, and master technical skills faster.
  </p>

  {/* FEATURES */}
  <div className='space-y-5'>
    {
      [
        {
          icon: <FaUserTie className="text-[#547792] text-xl" />,
          text: "Personalized Role-Based Interviews",
        },
        {
          icon: <FaMicrophoneAlt className="text-[#547792] text-xl" />,
          text: "Real-Time AI Voice Interaction",
        },
        {
          icon: <FaChartLine className="text-[#547792] text-xl" />,
          text: "Advanced Performance Insights",
        },
      ].map((item, index) => (
        <motion.div key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.15 }}
          whileHover={{ scale: 1.03 }}
          className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer border border-[#94B4C1] hover:border-[#547792] transition'>

          {item.icon}

          <span className='text-[#213448] font-medium'>
            {item.text}
          </span>

        </motion.div>
      ))
    }
  </div>

</motion.div>



              <motion.div
  initial={{ x: 80, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.7 }}
  className="p-12 bg-white">

  {/* HEADING */}
  <h2 className='text-3xl font-bold text-[#213448] mb-3'>
    Configure Your Interview
  </h2>

  {/* SUBTEXT */}
  <p className='text-[#547792] mb-8'>
    Customize your interview setup and let AI generate a personalized experience tailored to your goals.
  </p>

  <div className='space-y-6'>

    {/* ROLE INPUT */}
    <div className='relative'>
      <FaUserTie className='absolute top-4 left-4 text-[#547792]' />

      <input
        type='text'
        placeholder='Enter your target role (e.g. Frontend Developer)'
        className='w-full pl-12 pr-4 py-3 border border-[#94B4C1] rounded-xl focus:ring-2 focus:ring-[#547792] outline-none transition'
        onChange={(e) => setRole(e.target.value)}
        value={role}
      />
    </div>

    {/* EXPERIENCE INPUT */}
    <div className='relative'>
      <FaBriefcase className='absolute top-4 left-4 text-[#547792]' />

      <input
        type='text'
        placeholder='Your experience (e.g. 2 years)'
        className='w-full pl-12 pr-4 py-3 border border-[#94B4C1] rounded-xl focus:ring-2 focus:ring-[#547792] outline-none transition'
        onChange={(e) => setExperience(e.target.value)}
        value={experience}
      />
    </div>

    {/* MODE SELECT */}
    <select
      value={mode}
      onChange={(e) => setMode(e.target.value)}
      className='w-full py-3 px-4 border border-[#94B4C1] rounded-xl focus:ring-2 focus:ring-[#547792] outline-none transition text-[#213448]'>

      <option value="Technical">Technical Interview</option>
      <option value="HR">HR Interview</option>

    </select>

    {/* RESUME UPLOAD */}
    {!analysisDone && (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => document.getElementById("resumeUpload").click()}
        className='border-2 border-dashed border-[#94B4C1] rounded-xl p-8 text-center cursor-pointer hover:border-[#547792] hover:bg-[#E0F2FE] transition'>

        <FaFileUpload className='text-4xl mx-auto text-[#547792] mb-3' />

        <input
          type="file"
          accept="application/pdf"
          id="resumeUpload"
          className='hidden'
          onChange={(e) => setResumeFile(e.target.files[0])}
        />

        <p className='text-[#547792] font-medium'>
          {resumeFile 
            ? resumeFile.name 
            : "Upload your resume to unlock smarter AI questions (Optional)"}
        </p>

        {resumeFile && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={(e) => {
              e.stopPropagation();
              handleUploadResume()
            }}
            className='mt-4 bg-[#213448] text-white px-5 py-2 rounded-lg hover:bg-[#547792] transition'>

            {analyzing ? "Analyzing Resume..." : "Analyze with AI"}

          </motion.button>
        )}

      </motion.div>
    )}

                       {analysisDone && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className='bg-[#E0F2FE] border border-[#94B4C1] rounded-xl p-5 space-y-4'>

    {/* TITLE */}
    <h3 className='text-lg font-semibold text-[#213448]'>
      AI Resume Insights
    </h3>

    {/* PROJECTS */}
    {projects.length > 0 && (
      <div>
        <p className='font-medium text-[#213448] mb-1'>
          Key Projects:
        </p>

        <ul className='list-disc list-inside text-[#547792] space-y-1'>
          {projects.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    )}

    {/* SKILLS */}
    {skills.length > 0 && (
      <div>
        <p className='font-medium text-[#213448] mb-1'>
          Core Skills:
        </p>

        <div className='flex flex-wrap gap-2'>
          {skills.map((s, i) => (
            <span
              key={i}
              className='bg-[#94B4C1]/40 text-[#213448] px-3 py-1 rounded-full text-sm'>
              {s}
            </span>
          ))}
        </div>
      </div>
    )}

  </motion.div>
)}

{/* START BUTTON */}
<motion.button
  onClick={handleStart}
  disabled={!role || !experience || loading}
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.95 }}
  className='w-full disabled:bg-[#94B4C1] bg-[#213448] hover:bg-[#547792] text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>

  {loading ? "Preparing Your AI Interview..." : "Launch AI Interview"}

</motion.button>
                    </div>

                </motion.div>
            </div>

        </motion.div>
    )
}

export default Step1SetUp

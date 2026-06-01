import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App';
import Step3Report from '../components/Step3Report';
function InterviewReport() {
  const {id} = useParams()
  const [report,setReport] = useState(null);
   
  useEffect(()=>{
    const fetchReport = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id , {withCredentials:true})

        console.log(result.data)
        setReport(result.data)
      } catch (error) {
        console.log(error)
      }
    }

    fetchReport()
  },[])


    if (!report) {
    return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E0F2FE] to-white">

    {/* LOADING TEXT */}
    <p className="text-[#213448] text-lg font-semibold mb-3">
      Generating Your AI Report...
    </p>

    {/* SUBTEXT */}
    <p className="text-[#547792] text-sm">
      Please wait while we analyze your performance and prepare detailed insights.
    </p>

    {/* LOADING DOTS */}
    <div className="flex gap-2 mt-4">
      <span className="w-2 h-2 bg-[#547792] rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-[#547792] rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-[#547792] rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </div>

  </div>
);
  }

  return <Step3Report report={report}/>
}

export default InterviewReport

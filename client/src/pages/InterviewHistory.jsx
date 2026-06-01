import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App'
import { FaArrowLeft } from 'react-icons/fa'
function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true })

                setInterviews(result.data)

            } catch (error) {
                console.log(error)
            }

        }

        getMyInterviews()

    }, [])


    return (
  <div className='min-h-screen bg-gradient-to-br from-[#E0F2FE] to-white py-10'>

    <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>

      {/* HEADER */}
      <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>

        <button
          onClick={() => navigate("/")}
          className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
          <FaArrowLeft className='text-[#547792]' />
        </button>

        <div>
          <h1 className='text-3xl font-bold text-[#213448]'>
            Interview Activity History
          </h1>

          <p className='text-[#547792] mt-2'>
            Review your past interviews, track performance trends, and monitor your progress over time.
          </p>
        </div>

      </div>

      {/* EMPTY STATE */}
      {interviews.length === 0 ? (
        <div className='bg-white p-10 rounded-2xl shadow text-center border border-[#94B4C1]'>

          <p className='text-[#547792]'>
            No interviews found yet. Start your first AI interview to begin tracking your progress.
          </p>

        </div>
      ) : (

        /* LIST */
        <div className='grid gap-6'>

          {interviews.map((item, index) => (

            <div
              key={index}
              onClick={() => navigate(`/report/${item._id}`)}
              className='bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#94B4C1]'>

              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>

                {/* LEFT INFO */}
                <div>
                  <h3 className="text-lg font-semibold text-[#213448]">
                    {item.role}
                  </h3>

                  <p className="text-[#547792] text-sm mt-1">
                    {item.experience} • {item.mode}
                  </p>

                  <p className="text-xs text-[#547792] mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* RIGHT SIDE */}
                <div className='flex items-center gap-6'>

                  {/* SCORE */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#213448]">
                      {item.finalScore || 0}/10
                    </p>
                    <p className="text-xs text-[#547792]">
                      AI Score
                    </p>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-[#E0F2FE] text-[#213448]"
                        : "bg-[#94B4C1]/40 text-[#213448]"
                    }`}
                  >
                    {item.status === "completed" ? "Completed" : "In Progress"}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}
    </div>
  </div>
)
}

export default InterviewHistory

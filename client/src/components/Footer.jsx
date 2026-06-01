import React from 'react'
import { BsRobot } from 'react-icons/bs'

function Footer() {
  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pb-10 py-4 pt-10'>
      <div className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-[#94B4C1] py-8 px-3 text-center'>

        {/* LOGO */}
        <div className='flex justify-center items-center gap-3 mb-3'>
          <div className='bg-[#213448] text-white p-2 rounded-lg'>
            <BsRobot size={16}/>
          </div>
          <h2 className='font-semibold text-[#213448]'>IntelliPrep.AI</h2>
        </div>

        {/* TEXT */}
        <p className='text-[#547792] text-sm max-w-xl mx-auto leading-relaxed'>
          Empowering students and professionals to excel in interviews through 
          intelligent AI simulations, real-time feedback, and personalized performance insights.
        </p>

      </div>
    </div>
  )
}

export default Footer
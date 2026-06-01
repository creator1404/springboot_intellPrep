import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function Step3Report({ report }) {
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;


  const downloadPDF = () => {

  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 25;

  // ================= TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  // NAVY TITLE COLOR
  doc.setTextColor(33, 52, 72); // #213448

  doc.text(
    "IntelliPrep.AI Interview Performance Report",
    pageWidth / 2,
    currentY,
    { align: "center" }
  );

  currentY += 5;

  // underline (blue)
  doc.setDrawColor(84, 119, 146); // #547792
  doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

  currentY += 15;

  // ================= FINAL SCORE BOX =================
  doc.setFillColor(234, 242, 248); // light blue bg

  doc.roundedRect(
    margin,
    currentY,
    contentWidth,
    20,
    4,
    4,
    "F"
  );

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);

  doc.text(
    `Overall Interview Score: ${finalScore}/10`,
    pageWidth / 2,
    currentY + 12,
    { align: "center" }
  );

  currentY += 30;

  // ================= SKILLS BOX =================
  doc.setFillColor(245, 248, 252);

  doc.roundedRect(
    margin,
    currentY,
    contentWidth,
    30,
    4,
    4,
    "F"
  );

  doc.setFontSize(12);

  doc.text(
    `Confidence Level: ${confidence}`,
    margin + 10,
    currentY + 10
  );

  doc.text(
    `Communication Strength: ${communication}`,
    margin + 10,
    currentY + 18
  );

  doc.text(
    `Technical Accuracy: ${correctness}`,
    margin + 10,
    currentY + 26
  );

  currentY += 45;

  // ================= PROFESSIONAL ADVICE =================

  let advice = "";

  if (finalScore >= 8) {

    advice =
      "Outstanding performance detected. Your responses demonstrate clarity, structured thinking, and confidence. Continue refining examples and maintain consistency across interviews.";

  } else if (finalScore >= 5) {

    advice =
      "Solid foundational performance. Focus on improving response clarity, structured delivery, and supporting answers with practical examples.";

  } else {

    advice =
      "Improvement recommended. Practice structured thinking, enhance clarity, and build confidence through regular mock interview sessions.";

  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(148, 180, 193); // #94B4C1

  doc.roundedRect(
    margin,
    currentY,
    contentWidth,
    35,
    4,
    4
  );

  doc.setFont("helvetica", "bold");

  doc.setTextColor(33, 52, 72); // navy

  doc.text(
    "AI Performance Recommendation",
    margin + 10,
    currentY + 10
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const splitAdvice =
    doc.splitTextToSize(
      advice,
      contentWidth - 20
    );

  doc.text(
    splitAdvice,
    margin + 10,
    currentY + 20
  );

  currentY += 50;

  // ================= QUESTION TABLE =================

  autoTable(doc, {

    startY: currentY,

    margin: {
      left: margin,
      right: margin
    },

    head: [[
      "#",
      "Interview Question",
      "Score",
      "AI Feedback"
    ]],

    body: questionWiseScore.map((q, i) => [

      `${i + 1}`,
      q.question,
      `${q.score}/10`,
      q.feedback,

    ]),

    styles: {
      fontSize: 9,
      cellPadding: 5,
      valign: "top",
    },

    // BLUE HEADER
    headStyles: {
      fillColor: [84, 119, 146], // #547792
      textColor: 255,
      halign: "center",
    },

    columnStyles: {

      0: {
        cellWidth: 10,
        halign: "center"
      },

      1: {
        cellWidth: 55
      },

      2: {
        cellWidth: 20,
        halign: "center"
      },

      3: {
        cellWidth: "auto"
      },

    },

    alternateRowStyles: {
      fillColor: [245, 248, 252],
    },

  });

  // ================= FILE NAME =================

  doc.save("IntelliPrep_AI_Report.pdf");

};

  return (
  <div className='min-h-screen bg-gradient-to-br from-[#E0F2FE] to-white px-4 sm:px-6 lg:px-10 py-8'>

    <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>

      {/* LEFT SECTION */}
      <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>

        <button
          onClick={() => navigate("/history")}
          className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
          <FaArrowLeft className='text-[#547792]' />
        </button>

        <div>
          <h1 className='text-3xl font-bold text-[#213448]'>
            AI Performance Dashboard
          </h1>

          <p className='text-[#547792] mt-2'>
            Track your interview progress, analyze strengths, and improve with smart insights.
          </p>
        </div>

      </div>

      {/* DOWNLOAD BUTTON */}
      <button
        onClick={downloadPDF}
        className='bg-gradient-to-r from-[#213448] to-[#547792] hover:opacity-90 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base text-nowrap'>

        Download Detailed Report
      </button>

    </div>


     <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>

  <div className='space-y-6'>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center border border-[#94B4C1]">

      {/* TITLE */}
      <h3 className="text-[#547792] mb-4 sm:mb-6 text-sm sm:text-base">
        Overall Performance Score
      </h3>

      {/* CIRCLE */}
      <div className='relative w-20 h-20 sm:w-25 sm:h-25 mx-auto'>
        <CircularProgressbar
          value={percentage}
          text={`${score}/10`}
          styles={buildStyles({
            textSize: "18px",
            pathColor: "#547792",     // blue progress
            textColor: "#213448",     // navy text
            trailColor: "#E0F2FE",    // light blue background
          })}
        />
      </div>

      {/* LABEL */}
      <p className="text-[#547792] mt-3 text-xs sm:text-sm">
        AI Evaluated Score
      </p>

      {/* RESULT */}
      <div className="mt-4">
        <p className="font-semibold text-[#213448] text-sm sm:text-base">
          {performanceText}
        </p>

        <p className="text-[#547792] text-xs sm:text-sm mt-1">
          {shortTagline || "Insight-driven evaluation based on clarity, accuracy, and confidence."}
        </p>
      </div>

    </motion.div>

          <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 border border-[#94B4C1]'>

  {/* TITLE */}
  <h3 className="text-base sm:text-lg font-semibold text-[#213448] mb-6">
    Skill Performance Breakdown
  </h3>

  {/* SKILLS */}
  <div className='space-y-5'>
    {
      skills.map((s, i) => (
        <div key={i}>

          <div className='flex justify-between mb-2 text-sm sm:text-base'>
            <span className='text-[#547792]'>{s.label}</span>
            <span className='font-semibold text-[#213448]'>{s.value}/10</span>
          </div>

          <div className='bg-[#E0F2FE] h-2 sm:h-3 rounded-full'>
            <div
              className='bg-[#547792] h-full rounded-full transition-all duration-500'
              style={{ width: `${s.value * 10}%` }}
            ></div>
          </div>

        </div>
      ))
    }
  </div>

</motion.div>


</div>

{/* RIGHT SIDE */}

<div className='lg:col-span-2 space-y-6'>

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 border border-[#94B4C1]'>

    {/* TITLE */}
    <h3 className="text-base sm:text-lg font-semibold text-[#213448] mb-4 sm:mb-6">
      Performance Progress Timeline
    </h3>

    {/* CHART */}
    <div className='h-64 sm:h-72'>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={questionScoreData}>
          
          <CartesianGrid stroke="#E0F2FE" strokeDasharray="3 3" />

          <XAxis dataKey="name" stroke="#547792" />
          <YAxis domain={[0, 10]} stroke="#547792" />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#547792"
            fill="#94B4C1"
            strokeWidth={3}
          />

        </AreaChart>
      </ResponsiveContainer>

    </div>

  </motion.div>

          <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 border border-[#94B4C1]'>

  {/* TITLE */}
  <h3 className="text-base sm:text-lg font-semibold text-[#213448] mb-6">
    Question-Level Performance Insights
  </h3>

  <div className='space-y-6'>
    {questionWiseScore.map((q, i) => (

      <div
        key={i}
        className='bg-[#E0F2FE] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#94B4C1]'>

        {/* HEADER */}
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>

          <div>
            <p className="text-xs text-[#547792]">
              Question {i + 1}
            </p>

            <p className="font-semibold text-[#213448] text-sm sm:text-base leading-relaxed">
              {q.question || "Question not available"}
            </p>
          </div>

          {/* SCORE BADGE */}
          <div className='bg-[#94B4C1]/40 text-[#213448] px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit'>
            {q.score ?? 0}/10
          </div>

        </div>

        {/* FEEDBACK */}
        <div className='bg-white border border-[#94B4C1] p-4 rounded-lg'>

          <p className='text-xs text-[#547792] font-semibold mb-1'>
            AI Evaluation Insight
          </p>

          <p className='text-sm text-[#213448] leading-relaxed'>
            {q.feedback && q.feedback.trim() !== ""
              ? q.feedback
              : "No detailed feedback was generated for this response. Try improving clarity and structure in your answer."}
          </p>

        </div>

      </div>

    ))}
  </div>

</motion.div>





        </div>
      </div>

    </div>
  )
}

export default Step3Report

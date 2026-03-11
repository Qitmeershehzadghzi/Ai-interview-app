// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const pdf = require("pdf-parse");

// import generateInterviewReport from "../services/ai.service.js";
// import interviewReportModel from "../models/interviewReport.model.js";

// async function interviewController(req, res) {
//   try {

//     const resumeFile = req.file;

// const pdfData = await pdf(resumeFile.buffer);
// const resumeContent = pdfData.text;
//     const { selfDescription, jobDescription } = req.body;

//     const reportGenerateByAi = await generateInterviewReport({
//       resume: resumeContent.text,
//       selfDescription,
//       jobDescription
//     });

//     const interviewReport = await interviewReportModel.create({
//       userId: req.user.id,
//       resume: resumeContent.text,
//       selfDescription,
//       jobDescription,
//       ...reportGenerateByAi
//     });

//     res.status(201).json({
//       success: true,
//       data: interviewReport
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// }

// export default interviewController;


import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Is line ko exactly aise hi likhein
const pdf = require("pdf-parse");

import generateInterviewReport from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";

async function interviewController(req, res) {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required"
      });
    }

    // pdf() ko directly call karein
    const pdfData = await pdf(resumeFile.buffer);
    const resumeContent = pdfData.text;

    const { selfDescription, jobDescription } = req.body;

    const reportGenerateByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription
    });

    const interviewReport = await interviewReportModel.create({
      userId: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...reportGenerateByAi
    });

    res.status(201).json({
      success: true,
      data: interviewReport
    });

  } catch (error) {
    console.error("Interview Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred"
    });
  }
}

export default interviewController;

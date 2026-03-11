// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const pdf = require("pdf-parse");

// import generateInterviewReport from "../services/ai.service.js";
// import interviewReportModel from "../models/interviewReport.model.js";

// async function interviewController(req, res) {
//   try {

//     const resumeFile = req.file;

//     const resumeContent = await (new pdf.PDFParse(Uint8Array.from(resumeFile.buffer)).getText()) 

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
const pdf = require("pdf-parse");

import generateInterviewReport from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";

const interviewController = async (req, res) => {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    // PDF Extraction
    let resumeContent = '';
    try {
      const pdfData = await pdf(resumeFile.buffer);
      resumeContent = pdfData.text;
    } catch (pdfError) {
      console.error("PDF Parsing Error:", pdfError);
      return res.status(400).json({ success: false, message: "Invalid PDF file or unable to parse resume" });
    }

    const { selfDescription, jobDescription } = req.body;

    // AI Generation
    const reportGenerateByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription
    });

    // Database Entry
    // Note: Make sure req.user is populated by your auth middleware
    const interviewReport = await interviewReportModel.create({
      userId: req.user?.id || "anonymous", 
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...reportGenerateByAi
    });

    return res.status(201).json({ success: true, data: interviewReport });

  } catch (error) {
    console.error("Interview Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred"
    });
  }
};

export default interviewController;
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






import { PDFParse } from "pdf-parse";
import { generateResumePdf } from "../services/ai.service.js";
import generateInterviewReport from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";
/**
 * 
 * @description controller to generate interview based on resume and job description and self description
 * @access private
 * @route POST /interview
 * @returns 
 */
const interviewController = async (req, res) => {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    // PDF Extraction
    let resumeContent = '';
    try {
      const parser = new PDFParse({ data: resumeFile.buffer });
      // Prevent default page dividers (like '-- 1 of 1 --') by setting pageJoiner to an empty string.
      const pdfData = await parser.getText({ pageJoiner: '' });
      resumeContent = pdfData.text.trim();
      await parser.destroy();
    } catch (pdfError) {
      console.error("PDF Parsing Error:", pdfError.message || pdfError);
      return res.status(400).json({ success: false, message: "Invalid PDF file or unable to parse resume" });
    }

    if (!resumeContent) {
      return res.status(400).json({ success: false, message: "No readable text found in the PDF. Please ensure your resume is text-based and not a scanned image." });
    }

    const { selfDescription, jobDescription } = req.body;

    // AI Generation
    const reportGenerateByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription
    });

    console.log("=== RAW AI OUTPUT ===", JSON.stringify(reportGenerateByAi, null, 2));

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


export const generateInterviewReportById = async (req, res) => {
  try {

    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      userId: req.user.id
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: interviewReport
    });

  } catch (error) {

    console.error("Interview Report By Id Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
/**
 * @description controller to get all interview reports of a user
 */
export const getAllInterviewReports = async (req, res) => {

  try {

    const interviewReports = await interviewReportModel
      .find({ userId: req.user.id })   // 🔥 FIX HERE
      .sort({ createdAt: -1 })
      .select("-resume -jobDescription -selfDescription -_v -technicalQuestions -behavioralQuestions -skillGapAnalysis -preparationPlan")

    return res.status(200).json({
      success: true,
      data: interviewReports
    })

  } catch (error) {

    console.error("Get All Interview Reports Error:", error)

    return res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred"
    })

  }

}


/**
 * @description controller to generate resume pdf based on  user self description and job description and resume content
 */


export const generateResumePdfController = async (req, res) => {
  const {interviewId} = req.params;
  const interviewReport = await interviewReportModel.findById(interviewId);
  if(!interviewReport){
    return res.status(404).json({
      success: false,
      message: "Interview report not found"
    })
  }

  const {resume, jobDescription, selfDescription} = interviewReport;

const pdfBuffer = await generateResumePdf({resume, jobDescription, selfDescription});
res.set({
  "Content-Type": "application/pdf",
  "Content-Disposition": `attachment; filename=resume_${interviewId}.pdf`
})
res.send(pdfBuffer);
}


export default interviewController;
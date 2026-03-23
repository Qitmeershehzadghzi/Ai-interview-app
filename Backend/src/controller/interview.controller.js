const pdfParse = require("pdf-parse");

const {
  generateResumePdf,
  generateInterviewReport
} = require("../services/ai.service.js");

const interviewReportModel = require("../models/interviewReport.model.js");

/**
 * @description controller to generate interview report
 * @route POST /interview
 * @access private
 */
const interviewController = async (req, res) => {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required"
      });
    }

    if (!resumeFile.mimetype.includes("pdf")) {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed"
      });
    }

    // PDF extraction
    let resumeContent = "";

    try {
      const data = await pdfParse(resumeFile.buffer);
      resumeContent = data.text.trim();
    } catch (pdfError) {
      console.error("PDF Parsing Error:", pdfError);
      return res.status(400).json({
        success: false,
        message: "Invalid PDF or unable to extract text"
      });
    }

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in PDF"
      });
    }

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Self description and job description are required"
      });
    }

    // AI Generation
    const reportGenerateByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription
    });

    console.log("=== AI OUTPUT ===", reportGenerateByAi);

    // Save to DB
    const interviewReport = await interviewReportModel.create({
      userId: req.user?.id || "anonymous",
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...reportGenerateByAi
    });

    return res.status(201).json({
      success: true,
      data: interviewReport
    });

  } catch (error) {
    console.error("Interview Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * @description get interview report by id
 * @route GET /interview/report/:interviewId
 * @access private
 */
const generateInterviewReportById = async (req, res) => {
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
 * @description get all interview reports
 * @route GET /interview
 * @access private
 */
const getAllInterviewReports = async (req, res) => {
  try {
    const interviewReports = await interviewReportModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -jobDescription -selfDescription -__v");

    return res.status(200).json({
      success: true,
      data: interviewReports
    });

  } catch (error) {
    console.error("Get All Interview Reports Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * @description generate resume PDF
 * @route POST /interview/resume/pdf/:interviewId
 * @access private
 */
const generateResumePdfController = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findById(interviewId);

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found"
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewId}.pdf`
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("Generate Resume PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  interviewController,
  generateInterviewReportById,
  getAllInterviewReports,
  generateResumePdfController
};
const express = require("express");
const authMiddleware = require("../middleware/auth.middleware.js");
const {
  interviewController,
  generateInterviewReportById,
  getAllInterviewReports,
  generateResumePdfController
} = require("../controller/interview.controller.js");

const upload = require("../middleware/file.middleware.js");

const interviewRouter = express.Router();

/**
 * @route POST /interview
 */
interviewRouter.post(
  '/',
  authMiddleware.authUser,
  upload.single('resume'),
  interviewController
);

/**
 * @route GET /interview/report/:interviewId
 */
interviewRouter.get(
  '/report/:interviewId',
  authMiddleware.authUser,
  generateInterviewReportById
);

/**
 * @route GET /interview
 */
interviewRouter.get(
  '/',
  authMiddleware.authUser,
  getAllInterviewReports
);

/**
 * @route POST /interview/resume/pdf/:interviewId
 */
interviewRouter.post(
  '/resume/pdf/:interviewId',
  authMiddleware.authUser,
  generateResumePdfController
);

module.exports = interviewRouter;
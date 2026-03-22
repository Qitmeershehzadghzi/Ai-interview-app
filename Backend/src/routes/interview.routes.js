import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import interviewController from "../controller/interview.controller.js";
import upload from "../middleware/file.middleware.js";
import { generateInterviewReportById } from "../controller/interview.controller.js";
import { getAllInterviewReports } from "../controller/interview.controller.js";
import { generateResumePdfController } from "../controller/interview.controller.js";
const interviewRouter = express.Router();
/**
 * @route POST /interview
 * @desc Create a new interview
 * @access Private
 */
interviewRouter.post('/', authMiddleware.authUser,upload.single('resume'), interviewController);
/**
 * @route GET /interview/report/:interviewId
 * @desc Get interview report by id
 * @access Private
 */
interviewRouter.get('/report/:interviewId', authMiddleware.authUser, generateInterviewReportById);



/**
 * @route GET /api/interview
 * @desc Get interview report by id
 * @access Private
 */
interviewRouter.get('/', authMiddleware.authUser, getAllInterviewReports);
export default interviewRouter;


/**
 * @route POST /api/interview/report/InterviewReportId
 * @desc Get interview report by id
 * @access Private
 */


interviewRouter.post('/resume/pdf/:interviewId', authMiddleware.authUser, generateResumePdfController);
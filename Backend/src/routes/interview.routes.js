import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import interviewController from "../controller/interview.controller.js";
import upload from "../middleware/file.middleware.js";
const interviewRouter = express.Router();

interviewRouter.post('/', authMiddleware.authUser,upload.single('resume'), interviewController);

export default interviewRouter;
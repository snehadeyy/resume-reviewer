import express from "express"
import authUser from "../middleware/auth.middleware.js"
import { generateInterviewController, getInterviewReportByIdController } from "../controller/interview.controller.js"
import { upload } from "../middleware/file.middleware.js"

const interviewRouter = express.Router()

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description, resume pdf and job description.
 * @access private
 */

interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by id
 * @access private
 */

interviewRouter.get("/report/:interviewId", authUser, getInterviewReportByIdController)


export default interviewRouter
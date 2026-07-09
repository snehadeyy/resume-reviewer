import { Router } from "express";
import { loginUserController, logoutUserController, registerUserController, getMeController, forgotPasswordController, sendMailController, resetPasswordController, verifyOtpController } from "../controller/auth.controller.js";
import authUser from "../middleware/auth.middleware.js";

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register", registerUserController)

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */

authRouter.post('/login', loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add cookie in the blacklist
 * @access Public
 */
authRouter.get("/logout", logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged-in user details
 * @access private
 */
authRouter.get('/get-me', authUser, getMeController)

/**
 * @route POST /api/auth/forgot-password
 * @description verifies user and send them otp to their registered email
 * @access private
 */
authRouter.post('/forgot-password', forgotPasswordController)

/**
 * @route POST /api/auth/verify-otp
 * @description verifies the otp that was sent to user's email
 * @access private
 */
authRouter.post('/verify-otp', verifyOtpController)

/**
 * @route POST /api/auth/reset-password
 * @description resets the user's password
 * @access private
 */
authRouter.post('/reset-password', resetPasswordController)

/**
 * @route POST /api/auth/send-mail
 * @description sends welcome message through registered email
 * @access private
 */
authRouter.post('/send-mail', sendMailController)

export default authRouter
import { Router } from "express";
import { loginUserController, logoutUserController, registerUserController, getMeController, forgotPasswordController, sendMailController } from "../controller/auth.controller.js";
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
 * @description resets the user's password
 * @access private
 */
authRouter.post('/forgot-password', forgotPasswordController)

/**
 * 
 */
authRouter.post('/send-mail', sendMailController)
export default authRouter
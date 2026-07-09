import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { tokenBlacklistModel } from "../model/blacklist.model.js"; 
import transporter from "../config/mail.js";

/**
 * @name registerUserController
 * @description Registers a new user, expects username, email and password in the request body
 * @access Public
 */
const registerUserController = async (req,res)=>{
    const {username, email, password} = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await User.findOne({
        $or: [{email}, {username}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "Account already exists with this username or email address"
        })
    }

    const hash = await bcrypt.hash(password,10)

    const user = await User.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        {
        id: user._id,
        username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }

    )

    res.cookie("token",token)
    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 */
const loginUserController = async (req,res)=>{
    const {email, password} = req.body
    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
        return res.status(400).json({
            message: "invalid email or password"
        })
    }

    const token = jwt.sign(
        {
        id: user._id,
        username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }

    )
    res.cookie("token", token,{
        httpOnly: true,
        secure: true,
        sameSite: "None"
    })
    res.status(200).json({
        message: "user logged in successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email

        }
    })
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add token in the blacklist
 * @access public
 */
const logoutUserController = async (req,res) =>{
    const token = req.cookies.token

    if(token){
       await tokenBlacklistModel.create({token})
    }

    res.clearCookie("token")
    return res.status(201).json({
        message: "user logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access private
 */
const getMeController = async (req,res) =>{
    const user = await User.findById(req.user.id)

    console.log("Cookies:", req.cookies);

    res.status(200).json({
        message: "user details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name forgotPasswordController
 * @description generates otp for the registered email to reset the password
 * @access private
 */
const forgotPasswordController = async (req,res) =>{
    try{    
        const { email } = req.body
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                message: "user doesn't exist"
            })
        }

        let otp = Math.floor(100000 + Math.random() * 900000).toString()
        // console.log(otp)
        user.resetOtp = otp
        user.otpExpiry = Date.now() + 5*60*1000 // 5 min expiry

        await user.save()

        const mailOption = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP for password reset",
            text: `Your OTP is ${otp}`
        }

        await transporter.sendMail(mailOption)

        res.status(200).json({
            message: "otp sent to email successfully"
        })
    }
    catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

/**
 * @name verifyOtpController
 * @description verifies the otp with the email id
 * @access private
 */
const verifyOtpController = async (req,res) =>{
    const {email, otp} = req.body

    const user = await User.findOne({email})

    if(!user || user.resetOtp !== otp){
        return res.status(400).json({message: "Invalid otp"})
    }
    if(user.otpExpiry < Date.now()){
        return res.status(400).json({message: "OTP expired"})
    }

    res.status(200).json({message: "OTP verified"})
}

/**
 * @name resetPasswordController
 * @description resets user's password
 * @access private
 */
const resetPasswordController = async (req,res) =>{
    const {email, otp, newPassword} = req.body

    const user = await User.findOne({email})

    if(!user || user.resetOtp !== otp){
        return res.status(400).json({message: "Invalid otp"})
    }
    if(user.otpExpiry < Date.now()){
        return res.status(400).json({message: "OTP expired"})
    }

    const hashedPassword = await bcrypt.hash(newPassword,10)

    user.password = hashedPassword
    user.resetOtp = null
    user.otpExpiry = null

    await user.save()

    return res.status(200).json({message: "Password reset successfully"})
}

/**
 * @name sendMailController
 * @description sends mail to user
 * @access private
 */
const sendMailController = async (req,res) =>{
    try{
        const { receiver } = req.body

        const messageOption = {
            from: process.env.EMAIL,
            to: receiver,
            subject: "Welcome to our application",
            text: `Hello ${receiver}!`
        }

        const mailSend = await transporter.sendMail(messageOption)

        res.status(200).json({
            message: "email sent successfully"
        })
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
}
export {registerUserController, loginUserController, logoutUserController, getMeController, forgotPasswordController, sendMailController, resetPasswordController, verifyOtpController}

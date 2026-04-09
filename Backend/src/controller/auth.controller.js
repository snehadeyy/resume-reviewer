import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { tokenBlacklistModel } from "../model/blacklist.model.js"; 

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
        secure: false,
        sameSite: "lax"
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
export {registerUserController, loginUserController, logoutUserController, getMeController}
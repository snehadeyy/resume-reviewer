import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://resume-reviewer-frontend-ewwj.onrender.com",
    credentials: true
}))

/* Require all the routes here */
import authRouter  from "./routes/auth.routes.js"
import interviewRouter from "./routes/interview.routes.js"

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)

export {app}

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

// const ORIGIN = process.env.CORS_ORIGIN

app.use(express.json())
app.use(cookieParser())
// app.use(cors({
//     origin: ORIGIN || "http://localhost:5173",
//     credentials: true
// }))

const allowedOrigins = [
  "http://localhost:5173",
  "https://resume-reviewer-frontend-ewwj.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));

/* Require all the routes here */
import authRouter  from "./routes/auth.routes.js"
import interviewRouter from "./routes/interview.routes.js"

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)

export {app}

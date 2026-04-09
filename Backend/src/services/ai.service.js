import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error("API KEY is missing. Check your .env file.");
}


import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { $ZodCheckLengthEquals } from 'zod/v4/core';


console.log(API_KEY)

const ai = new GoogleGenAI({
  apiKey: API_KEY
});



const interviewReportSchema = z.object({
  matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
  technicalQuestions: z.array(z.object({
    question: z.string().describe("The technical question can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
  })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
  behavioralQuestions: z.array(z.object({
    question: z.string().describe("The technical question can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
  })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
  skillGaps: z.array(z.object({
    skill: z.string().describe("The skill which the candidate is lacking"),
    severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
  })).describe("List of skill gaps in the candidate's profile along with their severity"),
  preparationPlan: z.array(z.object({
    day: z.number().describe("The day number in the preparation plan, starting from 1"),
    focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
    tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
  })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
  title: z.string().describe("The title of the job for which the interview report is generated"),
})


const isValidQuestion = (obj) => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.question === "string" &&
    typeof obj.intention === "string" &&
    typeof obj.answer === "string"
  );
};

const isValidSkill = (obj) => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.skill === "string" &&
    ["low", "medium", "high"].includes(obj.severity)
  );
};

const isValidPlan = (obj) => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.day === "number" &&
    typeof obj.focus === "string" &&
    Array.isArray(obj.tasks)
  );
};

const normalizeArray = (arr, type) => {
  if (!Array.isArray(arr)) return [];

  const result = [];

  for (let i = 0; i < arr.length; i++) {

    if (type === "technical" || type === "behavioral") {
      if (arr[i] === "question") {
        result.push({
          question: arr[i + 1] || "",
          intention: arr[i + 3] || "",
          answer: arr[i + 5] || ""
        });
        i += 5;
      }
    }

    else if (type === "skill") {
      if (arr[i] === "skill") {
        result.push({
          skill: arr[i + 1] || "",
          severity: arr[i + 3] || "medium"
        });
        i += 3;
      }
    }

    else if (type === "plan") {
      if (arr[i] === "day") {
        result.push({
          day: Number(arr[i + 1]) || 1,
          focus: arr[i + 3] || "",
          tasks: Array.isArray(arr[i + 5]) ? arr[i + 5] : [arr[i + 5]]
        });
        i += 5;
      }
    }

    // fallback (stringified JSON case)
    else {
      try {
        const parsed = JSON.parse(arr[i]);
        if (typeof parsed === "object") {
          result.push(parsed);
        }
      } catch {}
    }
  }

  return result;
};

const normalizeAIResponse = (data) => {
  return {
    ...data,
    technicalQuestions: normalizeArray(data.technicalQuestions, "technical"),
    behavioralQuestions: normalizeArray(data.behavioralQuestions, "behavioral"),
    skillGaps: normalizeArray(data.skillGaps, "skill"),
    preparationPlan: normalizeArray(data.preparationPlan, "plan")
  };
};


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  //   const prompt = `Generate an interview report for a candidate with the following details:
  //                         Resume: ${resume}
  //                         Self Description: ${selfDescription}
  //                         Job Description: ${jobDescription}
                    
  // `

const prompt = `
Generate a COMPLETE interview report in STRICT JSON format.

⚠️ VERY IMPORTANT RULES:
- DO NOT return arrays of strings.
- ALL arrays MUST contain OBJECTS matching the schema.

FORMAT REQUIREMENTS:

technicalQuestions:
[
  {
    "question": "...",
    "intention": "...",
    "answer": "..."
  }
]

behavioralQuestions:
[
  {
    "question": "...",
    "intention": "...",
    "answer": "..."
  }
]

skillGaps:
[
  {
    "skill": "...",
    "severity": "low" | "medium" | "high"
  }
]

preparationPlan:
[
  {
    "day": number,
    "focus": "...",
    "tasks": ["...", "..."]
  }
]

You MUST include ALL fields:
- matchScore
- technicalQuestions (min 3)
- behavioralQuestions (min 3)
- skillGaps (min 2)
- preparationPlan (min 5)
- title

DO NOT skip any field.
DO NOT return partial or invalid JSON.

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
      temperature: 0.2
    }
  })

  // return JSON.parse(response.text)
  const rawData = JSON.parse(response.text);

// Debug (optional but useful)
console.log("RAW AI:", rawData);

const cleanData = normalizeAIResponse(rawData);

console.log("CLEAN DATA:", JSON.stringify(cleanData, null, 2));

console.log("RAW AI:", rawData);
console.log("CLEAN DATA:", cleanData);

return cleanData;

}

export { generateInterviewReport }



// import "../config/env.js"; // 🔥 ensures dotenv is loaded

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// export async function invokeGeminiAi(prompt) {
//     try {
//         if (!prompt) {
//             throw new Error("Prompt is required");
//         }

//         const model = genAI.getGenerativeModel({
//             model: "gemini-1.5-flash"
//         });

//         const result = await model.generateContent(prompt);

//         return result.response.text();

//     } catch (error) {
//         console.error("Gemini Error:", error.message);
//         throw error;
//     }
// }
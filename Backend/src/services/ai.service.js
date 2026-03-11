// import { GoogleGenAI } from "@google/genai";
// import { z } from "zod";
// import { zodToJsonSchema } from "zod-to-json-schema";

// const ai = new GoogleGenAI({
//   apiKey: process.env.YOUR_GEMINI_API_KEY || "AIzaSyDozapO8SdkDQRebd3oOzi24oSW-oxEv-g"
// });

// const interviewReportSchema = z.object({
//   matchScore: z
//     .number()
//     .min(0)
//     .max(100)
//     .describe(
//       "The match score between candidate's profile and job description"
//     ),

//   technicalQuestions: z
//     .array(
//       z.object({
//         question: z
//           .string()
//           .describe("Technical question asked in interview"),

//         intention: z
//           .string()
//           .describe("Why interviewer is asking this question"),

//         answer: z
//           .string()
//           .describe("How candidate should answer this question")
//       })
//     )
//     .describe("Technical interview questions"),

//   behavioralQuestions: z
//     .array(
//       z.object({
//         question: z
//           .string()
//           .describe("Behavioral interview question"),

//         intention: z
//           .string()
//           .describe("Why interviewer asks this behavioral question"),

//         answer: z
//           .string()
//           .describe("Best way candidate should answer")
//       })
//     )
//     .describe("Behavioral questions"),

//   skillGaps: z
//     .array(
//       z.object({
//         skill: z
//           .string()
//           .describe("Skill that candidate is missing"),

//         severity: z
//           .enum(["low", "medium", "high"])
//           .describe("Skill gap severity")
//       })
//     )
//     .describe("List of missing skills"),

//   preparationPlan: z
//     .array(
//       z.object({
//         day: z
//           .string()
//           .describe("Day number e.g Day 1"),

//         focus: z
//           .string()
//           .describe("Focus topic of that day"),

//         tasks: z
//           .array(z.string())
//           .describe("Tasks to complete that day")
//       })
//     )
//     .describe("Daily interview preparation plan")
// });

// // async function generateInterviewReport() {

// //   const prompt = `
// // Generate a detailed interview report for a candidate.

// // Candidate Resume:
// // ${resume}

// // Job Description:
// // ${jobDescription}

// // Self Description:
// // ${selfDescription}
// // `;

// //   const response = await ai.models.generateContent({
// //     model: "gemini-2.5-flash",
// //     contents: prompt,
// //     config: {
// //       responseMimeType: "application/json",
// //       responseJsonSchema: zodToJsonSchema(interviewReportSchema)
// //     }
// //   });

// //   return JSON.parse(response.text);
// // }
// async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

//   const prompt = `
// Generate a detailed interview report for a candidate.

// Candidate Resume:
// ${resume}

// Job Description:
// ${jobDescription}

// Self Description:
// ${selfDescription}
// `;

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: prompt,
//     config: {
//       responseMimeType: "application/json",
//       responseJsonSchema: zodToJsonSchema(interviewReportSchema)
//     }
//   });

//   return JSON.parse(response.text);
// }

// export default generateInterviewReport;








import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const genAI = new GoogleGenerativeAI(process.env.YOUR_GEMINI_API_KEY || "AIzaSyDozapO8SdkDQRebd3oOzi24oSW-oxEv-g");

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  behavioralQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  skillGaps: z.array(z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"])
  })),
  preparationPlan: z.array(z.object({
    day: z.string(),
    focus: z.string(),
    tasks: z.array(z.string())
  }))
});

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    }
  });

  const prompt = `
    Generate a detailed interview report for a candidate.
    Candidate Resume: ${resume}
    Job Description: ${jobDescription}
    Self Description: ${selfDescription}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

export default generateInterviewReport;

import { GoogleGenAI, Type } from "@google/genai";
import puppeteer from "puppeteer";
 import { zodToJsonSchema } from "zod-to-json-schema";
 import {z} from "zod"; 
const ai = new GoogleGenAI({
  apiKey: process.env.YOUR_GEMINI_API_KEY || "AIzaSyDozapO8SdkDQRebd3oOzi24oSW-oxEv-g"
});

const interviewReportSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: "The match score between candidate's profile and job description (0-100)"
    },
    technicalQuestions: {
      type: Type.ARRAY,
      description: "Technical interview questions",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Technical question asked in interview" },
          intention: { type: Type.STRING, description: "Why interviewer is asking this question" },
          answer: { type: Type.STRING, description: "How candidate should answer this question" }
        },
        required: ["question", "intention", "answer"]
      }
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      description: "Behavioral questions",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Behavioral interview question" },
          intention: { type: Type.STRING, description: "Why interviewer asks this behavioral question" },
          answer: { type: Type.STRING, description: "Best way candidate should answer" }
        },
        required: ["question", "intention", "answer"]
      }
    },
    skillGapAnalysis: {
      type: Type.ARRAY,
      description: "List of missing skills",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING, description: "Skill that candidate is missing" },
          severity: { type: Type.STRING, description: "Skill gap severity (low, medium, high)" }
        },
        required: ["skill", "severity"]
      }
    },
    preparationPlan: {
      type: Type.ARRAY,
      description: "Daily interview preparation plan",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day number e.g Day 1" },
          focus: { type: Type.STRING, description: "Focus topic of that day" },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tasks to complete that day" }
        },
        required: ["day", "focus", "tasks"]
      }
    },
    title: { type: Type.STRING, description: "Title of the interview report" }
  },
  required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGapAnalysis", "preparationPlan", "title"]
};


async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

  const prompt = `
Generate a detailed interview report for a candidate.

Candidate Resume:
${resume}

Job Description:
${jobDescription}

Self Description:
${selfDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert technical interviewer. You must evaluate the candidate's resume against the given job description and output a strict JSON strictly adhering to the schema. Do not deviate from the schema.",
      responseMimeType: "application/json",
      responseSchema: interviewReportSchema
    }
  });

  return JSON.parse(response.text);
}
async function generatePdfForHtml(htmlContent) {
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlContent, {
  waitUntil: 'networkidle2',
});
const pdfBuffer = await page.pdf({ format: 'A4' });
await browser.close();
return pdfBuffer;
}
 async function generateResumePdf({ resume, jobDescription, selfDescription }) {
  const resumePdfSchema = z.object({
    html: z.string().describe("HTML content of the resume which can be used to generate PDF")
  });
  const prompt = `
Generate a resume  for a candidate's with the following details:
Candidate Resume:${resume}
Job Description:${jobDescription}
Self Description:${selfDescription}
the response should be a JSON with only one field "html" which contains the HTML content of the resume which can be used to generate PDF
`
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: zodToJsonSchema(resumePdfSchema)
  }
});
const jsonContent = JSON.parse(response.text);
const pdfBuffer = await generatePdfForHtml(jsonContent.html);
return pdfBuffer;

}
export default {  generateInterviewReport, generateResumePdf };
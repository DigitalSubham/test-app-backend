import PdfParse from "pdf-parse";
import { promptFn } from "./prompt";
import { GoogleGenAI } from "@google/genai";
import { topicData } from "./topicData";
import { PDFDocument } from "pdf-lib";

const extractTextFromPdf = async (pdfBuffer: Uint8Array | Buffer) => {
  const buffer = Buffer.isBuffer(pdfBuffer)
    ? pdfBuffer
    : Buffer.from(pdfBuffer);
  const data = await PdfParse(buffer);
  return data.text;
};

export const pdfToText = async (
  pdf: Buffer,
  uptoPage: number,
  eachTimePage: number,
  chapterId: string,
  chapterName: string
) => {
  try {
    const allQuestions: any[] = [];
    console.log("allQuestions", allQuestions);
    const fullPdf = await PDFDocument.load(pdf);
    const totalPages = fullPdf.getPageCount();
    const endPage = Math.min(uptoPage, totalPages);

    for (
      let currentPage = 0;
      currentPage < endPage;
      currentPage += eachTimePage
    ) {
      const start = currentPage;
      const end = Math.min(currentPage + eachTimePage, endPage);

      const partialPdf = await PDFDocument.create();
      for (let i = start; i < end; i++) {
        const [copiedPage] = await partialPdf.copyPages(fullPdf, [i]);
        partialPdf.addPage(copiedPage);
      }

      const partialPdfBytes = await partialPdf.save();
      const text = await extractTextFromPdf(partialPdfBytes); // ⬅️ Custom function
      const questions = await parseQuestionsFromText(
        text,
        chapterId,
        chapterName
      );

      allQuestions.push(...questions);
    }

    return allQuestions;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF in chunks");
  }
};

const cleanJsonString = (text: string) => {
  return text
    .replace(/```json/g, "") // remove ```json
    .replace(/```/g, "") // remove ```
    .trim(); // remove leading/trailing whitespace
};

export const parseQuestionsFromText = async (
  text: string,
  chapterId: string,
  chapterName: string
): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = promptFn(text, topicData[chapterId], chapterName);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: prompt,
  });
  let questionData: any[] = [];
  try {
    if (response?.text) {
      const cleaned = cleanJsonString(response.text);
      questionData = JSON.parse(cleaned);
      return questionData;
    }
  } catch (error) {
    console.error("❌ Failed to parse JSON from Gemini:", error);
    console.log("🔎 Raw Response:", response.text);
  }
  return questionData;
};

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { pdfToText } from "../utils";

const prisma = new PrismaClient();

// Helper function to validate question structure
const isValidQuestion = (q: any): boolean => {
  return (
    typeof q.question === "string" &&
    typeof q.correct_answer === "string" &&
    typeof q.explanation === "string" &&
    typeof q.difficulty === "string" &&
    Array.isArray(q.tags) &&
    q.tags.length > 0 &&
    Array.isArray(q.options) &&
    q.options.every(
      (opt: any) =>
        typeof opt === "object" &&
        typeof opt.key === "string" &&
        typeof opt.text === "string"
    )
  );
};

export const insertQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { chapterId, questions } = req.body;

  if (!chapterId || isNaN(Number(chapterId))) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing chapterId",
    });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Questions array is missing or empty",
    });
  }

  // Validate each question
  for (const q of questions) {
    if (!isValidQuestion(q)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question structure detected",
        question: q,
      });
    }
  }

  try {
    // Upsert tags
    const tagNames: string[] = Array.from(
      new Set(questions.flatMap((q: any) => q.tags))
    );
    const upsertedTags = await prisma.$transaction(
      tagNames.map((name) =>
        prisma.chapterTag.upsert({
          where: { chapterId_name: { chapterId, name } },
          create: { chapterId, name },
          update: {},
        })
      )
    );

    const chapterTagMap: Record<string, number> = {};
    upsertedTags.forEach((ct: any) => {
      chapterTagMap[ct.name] = ct.id;
    });

    // Insert questions
    await prisma.$transaction(
      questions.map((q: any) =>
        prisma.question.create({
          data: {
            question: q.question,
            correctAnswer: q.correct_answer,
            difficulty: q.difficulty,
            options: q.options,
            explanation: q.explanation,
            chapter: { connect: { id: Number(chapterId) } },
            tags: {
              create: q.tags.map((tag: string) => ({
                chapterTag: { connect: { id: chapterTagMap[tag] } },
              })),
            },
          },
        })
      )
    );

    return res
      .status(201)
      .json({ success: true, message: "Questions inserted successfully" });
  } catch (error) {
    console.error("Error inserting questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to insert questions",
      error: (error as Error).message,
    });
  }
};

export const extractQuestionsFromPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pdf = await req.body;
  const { chapterId, chapterName, pageEachTime, uptoPageNo } = req.query;

  if (
    !chapterId ||
    isNaN(Number(chapterId)) ||
    !chapterName ||
    typeof chapterName !== "string" ||
    !uptoPageNo ||
    isNaN(Number(uptoPageNo)) ||
    !pageEachTime ||
    isNaN(Number(pageEachTime))
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
    });
  }

  try {
    const extractedQuestions = await pdfToText(
      pdf,
      Number(uptoPageNo),
      Number(pageEachTime),
      String(chapterId),
      String(chapterName)
    );

    if (!Array.isArray(extractedQuestions) || extractedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No questions found in the PDF",
      });
    }

    req.body.questions = extractedQuestions;
    req.body.chapterId = Number(chapterId); // Ensure numeric
    await insertQuestions(req, res, next); // Already handles response
  } catch (error) {
    console.error("Error extracting questions from PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to extract questions from PDF",
      error: (error as Error).message,
    });
  }
};

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const insertQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { chapterId, questions } = req.body;
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
            chapter: { connect: { id: chapterId } },
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

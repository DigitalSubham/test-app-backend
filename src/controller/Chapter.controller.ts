import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
/**
 * Create a new chapter under a given subject
 */
export const createChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { subjectId, name } = req.body;
  try {
    const chapter = await prisma.chapter.create({
      data: { subjectId, name },
    });
    return res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create chapter" });
  }
};

export const createChapterInBulk = async (req: Request, res: Response) => {
  try {
    const { chapter } = req.body;

    console.log("chapter", chapter);

    if (!Array.isArray(chapter) || chapter.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input. 'chapter' must be a non-empty array.",
      });
    }

    const createdChapters = await prisma.chapter.createMany({
      data: chapter,
      skipDuplicates: true, // Prevents inserting duplicates based on unique constraints
    });

    return res.status(201).json({
      success: true,
      message: "Chapters created successfully",
      data: createdChapters,
    });
  } catch (error) {
    console.error("Error creating chapters in bulk:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create chapters in bulk",
    });
  }
};

/**
 * Get all chapters, optionally filtered by subject
 */
export const getChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const subjectId = req.query.subjectId
    ? Number(req.query.subjectId)
    : undefined;
  try {
    const chapters = await prisma.chapter.findMany({
      where: subjectId ? { subjectId } : {},
      include: { subject: true },
    });
    return res.json({ success: true, data: chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch chapters" });
  }
};

/**
 * Retrieve a single chapter by ID, including tags
 */
export const getChapterById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const chapterId = Number(req.params.chapterId);
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { chapterTags: true },
    });
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }
    return res.json({ success: true, data: chapter });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch chapter" });
  }
};

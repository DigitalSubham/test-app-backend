import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
/**
 * Create a new Subject
 * POST /subjects
 */
export const createSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  try {
    const subject = await prisma.subject.create({ data: { name } });
    return res
      .status(201)
      .json({ success: true, message: "successfull", data: subject });
  } catch (error) {
    console.error("Error creating subject:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create subject" });
  }
};

/**
 * Get all Subjects
 * GET /subjects
 */
export const getSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch subjects" });
  }
};

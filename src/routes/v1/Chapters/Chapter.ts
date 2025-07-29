import { Router } from "express";
import {
  createChapter,
  createChapterInBulk,
  getChapterById,
  getChapters,
} from "../../../controller/Chapter.controller";

export const chapterRouter = Router();

chapterRouter.route("/chapter").post(createChapter).get(getChapters);
chapterRouter.route("/chapter-in-bulk").post(createChapterInBulk);
chapterRouter.route("/chapter-topics").get(getChapterById);

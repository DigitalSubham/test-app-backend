import express, { Router } from "express";
import {
  extractQuestionsFromPDF,
  insertQuestions,
} from "../../../controller/Question.controller";

export const questionRouter = Router();

questionRouter.route("/insert-question").post(insertQuestions);
questionRouter
  .route("/insert-questions-bulk")
  .post(
    express.raw({ type: "application/pdf", limit: "10mb" }),
    extractQuestionsFromPDF
  );

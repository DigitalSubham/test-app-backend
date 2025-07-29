import { Router } from "express";
import { insertQuestions } from "../../../controller/Question.controller";

export const questionRouter = Router();

questionRouter.route("/insert-question").post(insertQuestions);

import { Router } from "express";
import {
  createSubject,
  getSubjects,
} from "../../../controller/Subject.controller";

export const subjectRouter = Router();

subjectRouter.route("/subject").post(createSubject).get(getSubjects);

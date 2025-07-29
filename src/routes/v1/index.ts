import express from "express";
import { subjectRouter } from "./Subject/Subject";
import { chapterRouter } from "./Chapters/Chapter";
import { questionRouter } from "./Questions/Question";

const app = express();

app.use("/chapters", chapterRouter);
app.use("/subjects", subjectRouter);
app.use("/questions", questionRouter);

export default app;

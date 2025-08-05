import express, { Request, Response } from "express";
import v1 from "./routes";
import cors from "cors";
import path from "path";
const app = express();

const port = process.env.PORT || 4000;
app.use(cors()).use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

app.use("/v1", v1);

app.listen(port, () => {
  console.log(`server is spriting at http://localhost:${port}`);
});

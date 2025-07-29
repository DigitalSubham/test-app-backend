import express, { Request, Response } from "express";
import v1 from "./routes";
import cors from "cors";
const app = express();

const port = process.env.PORT || 4000;
app.use(cors()).use(express.json({ limit: "10mb" }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello i am from Patna");
});

app.use("/v1", v1);

app.listen(port, () => {
  console.log(`server is spriting at http://localhost:${port}`);
});

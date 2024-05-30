import express, { Application, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';

import { packageRouter } from "./packages/package.router";

dotenv.config();

const PORT = process.env.PORT || "8080";
const HOST = process.env.HOST || "0.0.0.0";

const app:Application = express();

// app.get("/", async (req:Request, res:Response) => {
//     res.sendFile(process.cwd() + "/src/index.html");
// });

app.use(cors({origin: '*'}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded());

app.use("/api/packages", packageRouter);

app.listen(parseInt(PORT), HOST, 511, () => {
    console.log(`Server is running on PORT ${PORT} on HOST ${HOST}`);
})
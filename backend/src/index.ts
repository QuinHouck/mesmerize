import express, { Application, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';

import { packageRouter } from "./packages/package.router";

dotenv.config();

const { PORT } = process.env || 3000;

const app:Application = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded());
app.use(cors({ origin: true }));

app.use("/api/packages", packageRouter);;

app.get("/", async (req:Request, res:Response) => {
    res.sendFile(process.cwd() + "/src/index.html");
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})
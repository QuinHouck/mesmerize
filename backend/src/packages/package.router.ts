import express, { Request, Response } from "express";

import * as PackageService from "./package.service";
export const packageRouter = express.Router();

// GET: List of all Users
packageRouter.get("/", async (req: Request, res: Response) => {
    try {
        const packages = await PackageService.getAvailable();

        return res.status(200).json(packages);
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
});
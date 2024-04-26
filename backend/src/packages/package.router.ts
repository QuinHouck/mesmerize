import express, { Request, Response } from "express";

import * as PackageService from "./package.service";
export const packageRouter = express.Router();

// GET: List of all Packages
packageRouter.get("/", async (req: Request, res: Response) => {
    try {
        const packages = await PackageService.getAvailablePackages();

        return res.status(200).json(packages);
    } catch (error: any) {
        console.log("BAD")
        return res.status(500).send(error.message);
    }
});

// GET: List of all Packages
packageRouter.get("/:name", async (req: Request, res: Response) => {
    try {
        const name: string = req.params.name;
        // console.log("Name: ", name);
        const package_items = await PackageService.getPackage(name);

        return res.status(200).json(package_items);
    } catch (error: any) {
        console.log("BAD")
        return res.status(500).send(error.message);
    }
});
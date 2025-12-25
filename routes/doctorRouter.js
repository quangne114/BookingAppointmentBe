import express from "express";
import { authorize } from "../middlewares/Authorize/Authorize.js";
import { authenticatedToken } from "../middlewares/AuthenticatedToken/AuthenticatedToken.js";
import { createDoctor } from "../controllers/doctorController.js";
export const doctorRouter = express.Router();

doctorRouter.post("/", authenticatedToken, authorize("doctor"), createDoctor);
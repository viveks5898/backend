import express from "express";
import { analyzeMatchController } from "../controllers/openAiController.js";

const router = express.Router();

router.post("/analyze-match", analyzeMatchController);

export default router;

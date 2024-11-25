import express from "express";
import { analyzeMatchController } from "../controllers/openAiController.js";
import { generatePayload } from "../services/sportMonkServices.js";

const router = express.Router();

router.post("/analyze-match", analyzeMatchController);

router.get("/payload", generatePayload)

export default router;

import { analyzeMatch } from "../services/openAiService.js";

/**
 * Controller to handle OpenAI match analysis.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const analyzeMatchController = async (req, res) => {
    try {
        const payload = req.body;

        if (!payload || typeof payload !== "object") {
            return res.status(400).json({ message: "Invalid payload" });
        }

        const analysis = await analyzeMatch(payload);
        res.status(200).json({ message: "Analysis successful", data: analysis });
    } catch (error) {
        console.error("Error analyzing match:", error.message);
        res.status(500).json({ message: "Error analyzing match", error: error.message });
    }
};

export { analyzeMatchController };

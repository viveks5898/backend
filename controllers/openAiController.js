import { analyzeMatchStream } from "../services/openAiService.js";

/**
 * Controller to handle OpenAI match analysis with streaming.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const analyzeMatchController = async (req, res) => {
    try {
        const payload = req.body;

        if (!payload || typeof payload !== "object") {
            return res.status(400).json({
                status: "error",
                message: "Invalid payload. Expected a JSON object.",
                data: null,
            });
        }

        await analyzeMatchStream(res, payload); // Stream response to the client
    } catch (error) {
        console.error("Error analyzing match:", error.message);
        res.status(500).json({
            status: "error",
            message: "Error analyzing match",
            error: error.message,
        });
    }
};

export { analyzeMatchController };

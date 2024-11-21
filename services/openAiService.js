import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AGENT_NAME = process.env.AGENT_NAME || "asst_87UAz2YxWcN4BrtrLPXQwZLo";

if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not set in environment variables");
}

// Initialize OpenAI with the API key
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

/**
 * Analyzes a football match based on provided data using OpenAI's ChatGPT model.
 *
 * @param {Object} payload The data containing details about the football match.
 * @returns {Promise<string>} A promise that resolves to a string containing the analysis.
 */
const analyzeMatch = async (payload) => {
    try {
        // Construct the message content using the agent name and match payload
        const prompt = `You are ${AGENT_NAME}. Analyze the following football match data and provide detailed insights:\n${JSON.stringify(payload)}`;

        // Call OpenAI's chat completion endpoint
        const response = await openai.chat.completions.create({
            model: "gpt-4", // Specify the model (e.g., "gpt-4" or "gpt-3.5-turbo")
            messages: [
                { role: "system", content: "You are an expert football analyst." },
                { role: "user", content: prompt },
            ],
            max_tokens: 1500, // Limit response size
            temperature: 0.7, // Adjust creativity
        });

        // Extract and return the AI's response text
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error communicating with OpenAI:", error.message);
        throw new Error("Failed to get a response from OpenAI");
    }
};

export { analyzeMatch };

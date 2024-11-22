import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios";  // We are using axios to fetch assistant details

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AGENT_ID = process.env.AGENT_ID;

if (!OPENAI_API_KEY || !AGENT_ID) {
    throw new Error("OpenAI API key or Agent ID is not set in environment variables");
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const fetchAgentInstructions = async () => {
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/assistants/${AGENT_ID}`,
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2",  // Optional header for the beta version
                },
            }
        );

        if (response.status === 200) {
            // If the response is successful, extract the instructions
            const instructions = response.data.instructions;
            console.log("Agent Instructions fetched successfully:", instructions);
            return instructions;
        } else {
            throw new Error(`Failed to fetch agent instructions, status code: ${response.status}`);
        }
    } catch (error) {
        // Enhanced error handling for debugging
        console.error("Error fetching agent instructions:", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch agent instructions");
    }
};

const analyzeMatch = async (payload) => {
    try {
        // Fetch the instructions for the agent
        const instructions = await fetchAgentInstructions();



        const response = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                {
                    role: "system",
                    content: instructions,
                },
                {
                    role: "user",
                    content: JSON.stringify(payload), 
                },
            ],
            max_tokens: 1500,
            temperature: 0.7,
        });

        console.log(response.choices[0].message.content); // Log response for debugging
        return response.choices[0].message.content.trim(); // Return the assistant's message content
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        throw new Error("Failed to get a response from OpenAI");
    }
};

export { analyzeMatch };

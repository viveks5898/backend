import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AGENT_ID = process.env.AGENT_ID;

if (!OPENAI_API_KEY || !AGENT_ID) {
  throw new Error(
    "OpenAI API key or Agent ID is not set in environment variables"
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Fetch agent instructions from OpenAI API.
 * @returns {Promise<string>} The agent's instructions.
 */
const fetchAgentInstructions = async () => {
  try {
    const response = await axios.get(
      `https://api.openai.com/v1/assistants/${AGENT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    if (response.status === 200 && response.data.instructions) {
      console.log("Agent Instructions fetched successfully");
      return response.data.instructions;
    }

    throw new Error(
      `Failed to fetch instructions. Response: ${JSON.stringify(response.data)}`
    );
  } catch (error) {
    console.error(
      "Error fetching agent instructions:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch agent instructions");
  }
};

/**
 * Stream analysis from OpenAI API.
 * @param {Object} res - Express response object for SSE.
 * @param {Object} payload - The data payload to analyze.
 */

const analyzeMatchStream = async (res, payload) => {
  try {
    const instructions = await fetchAgentInstructions();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o", // Ensure the correct model is specified
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
      stream: true, // Enable streaming
    });

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Process streaming chunks
    for await (const chunk of stream) {
      const messageContent = chunk.choices[0]?.delta?.content || "";
      if (messageContent) {
        res.write(`data: ${messageContent}`); // Ensure proper newline format for SSE
      }
    }

    res.write("data: "); // Send a completion signal to the client
    res.end(); // End the stream

  } catch (error) {
    console.error(
      "Error during streaming:",
      error.response?.data || error.message
    );
    res.write("data: Error during streaming\n\n");
    res.end();
  }
};


export { analyzeMatchStream };

const axios = require("axios");
require("dotenv").config();

module.exports.getAIResponse = async (req, res) => {
    try {
        console.log("Incoming AI Request:", req.body);
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Mistral API key is missing" });
        }

        const response = await axios.post(
            "https://api.mistral.ai/v1/chat/completions",
            {
                model: "mistral-medium",
                messages: [{ role: "system", content: "You are an AI assistant." }, { role: "user", content: message }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("AI Response Data:", response.data); // Debugging log

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            return res.status(500).json({ error: "Invalid response from AI service" });
        }

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("AI Chatbot Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};

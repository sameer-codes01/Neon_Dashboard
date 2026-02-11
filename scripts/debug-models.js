const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Load env specific contents from .env file
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        let key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

const API_KEY = env.GEMINI_API_KEY;

if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    console.error("Error: GEMINI_API_KEY is missing or invalid in .env file.");
    process.exit(1);
}

const output = [];

async function listModels() {
    console.log("Listing available models via REST API...");
    output.push("Listing available models via REST API...");

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ API Error: ${response.status} ${response.statusText}`);
            console.log(`Error Body: ${errorText}`);
            output.push(`❌ API Error: ${response.status} ${response.statusText}`);
            output.push(`Error Body: ${errorText}`);
            return;
        }

        const data = await response.json();
        if (data.models && data.models.length > 0) {
            console.log("✅ Models found available to your API Key:");
            output.push("✅ Models found available to your API Key:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    const msg = `   - ${m.name} (version: ${m.version}, displayName: ${m.displayName})`;
                    console.log(msg);
                    output.push(msg);
                }
            });
        } else {
            console.log("⚠️ No models found.");
            output.push("⚠️ No models found.");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        output.push(`Fetch Error: ${error.message}`);
    }

    fs.writeFileSync(path.resolve(__dirname, 'model-list.txt'), output.join('\n'));
    console.log("Output written to model-list.txt");
}

listModels();

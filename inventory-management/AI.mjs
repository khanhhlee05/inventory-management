import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import 'dotenv/config';

// Initialize the Google Generative AI client with your API key.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
const result = await model.generateContent([
"Describe the picture below in 1 to 2 words",
{inlineData: {data: Buffer.from(fs.readFileSync('./images/test_apple.jpg')).toString("base64"),
mimeType: 'image/png'}}]
);
console.log(result.response.text());
}
run();

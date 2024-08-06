const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },    
];
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });

const chats = new Map();

async function startChat(clientId) {
  if (!chats.has(clientId)) {
    const chat = await model.startChat();
    chats.set(clientId, chat);
  }
}

async function sendMessage(clientId, message) {
  if (!chats.has(clientId)) {
    await startChat(clientId);
  }
  const chat = chats.get(clientId);
  try {
    const result = await chat.sendMessage(message);
    let responseText = await result.response.text();
    responseText = responseText.trim();
    (() => {
        // remove quotations
        let responseType = responseText.match(/\[\w+]$/)?.[0] || '';
        responseText = responseText.replace(/["“”]/g, "'");
        let dialog = responseText.replace(/\[\w+]$/, '').trim();
        
        if (dialog.startsWith('\'') && dialog.endsWith('\'')) {
            dialog = dialog.slice(1, -1);
        }
    
        responseText = (dialog + ' ' + responseType).trim();
        responseText = responseText.replace(/’/g, "'")
    })();

    console.log(`Client ${clientId} - You: ${message}`);
    console.log(`Client ${clientId} - Chatbot: ${responseText}`);
    return responseText;
  } catch (error) {
    console.error(`Client ${clientId} - Error:`, error);
    return `GEMINI FATAL ERROR, An error occurred while processing your message: ${error.message}`;  // Return the error message
  }
}


module.exports = { sendMessage, startChat };
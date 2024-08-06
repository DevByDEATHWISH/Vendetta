const { WebSocketServer } = require('ws');
const { sendMessage, startChat } = require('./gemini');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  const clientId = uuidv4();
  console.log(`Client connected: ${clientId}`);
  
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    const cleanedData = data.toString().replace(/^"(.*)"$/, '$1');
    
    const response = await sendMessage(clientId, cleanedData);
    if (response) {
      ws.send(response);
    } else {
      ws.send(`An error occurred while processing your message.`);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
  });

  startChat(clientId);
});

console.log('WebSocket server is running on ws://localhost:8080');
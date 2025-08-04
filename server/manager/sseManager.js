const clients = new Set(); // Stores all connected SSE response objects

// Middleware to set up an SSE connection
function setupSSEConnection(req, res, next) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    clients.add(res);

    req.on('close', () => {
        clients.delete(res);
        console.log("SSE client disconnected.");
    });

    console.log("SSE client connected.");
}

// Function to send an event to all connected SSE clients
function sendEvent(data) {
    const eventData = JSON.stringify(data);
    clients.forEach(client => {
        try {
            client.write(`data: ${eventData}\n\n`); // SSE format: data: <payload>\n\n
        } catch (error) {
            console.error("Error writing to SSE client:", error.message);
        }
    });
}

module.exports = {
    setupSSEConnection,
    sendEvent,
};
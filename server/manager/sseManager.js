const clients = new Set(); // Stores all connected SSE response objects

// Middleware to set up an SSE connection
function setupSSEConnection(req, res, next) {
    // Set CORS headers first - make sure they match your main CORS config
    const allowedOrigin = process.env.CLIENT_URL;
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering if behind proxy
    
    // Send headers immediately
    res.flushHeaders();

    // Add client to active connections
    clients.add(res);

    try {
        // Send initial heartbeat/keep-alive comment
        res.write(':\n\n');
        console.log("SERVER DEBUG: Sent initial SSE heartbeat to client");
        
        // Send a welcome message
        const welcomeData = JSON.stringify({
            status: 'info',
            message: 'Connected to registration events stream'
        });
        res.write(`data: ${welcomeData}\n\n`);
        
    } catch (writeError) {
        console.error("SERVER ERROR: Failed to send initial SSE data:", writeError.message);
    }

    // Handle client disconnect
    req.on('close', () => {
        clients.delete(res);
        console.log("SSE client disconnected. Active clients:", clients.size);
    });

    req.on('aborted', () => {
        clients.delete(res);
        console.log("SSE client connection aborted. Active clients:", clients.size);
    });

    res.on('close', () => {
        clients.delete(res);
        console.log("SSE response closed. Active clients:", clients.size);
    });

    console.log("SSE client connected. Active clients:", clients.size);
    
}

// Function to send an event to all connected SSE clients
function sendEvent(data) {
    // if (clients.size === 0) {
    //     console.log("No SSE clients connected, skipping event:", data);
    //     return;
    // }

    const eventData = JSON.stringify(data);
    const clientsToRemove = [];
    
    clients.forEach(client => {
        if (client.destroyed || client.writableEnded) {
            clientsToRemove.push(client);
            return;
        }
        
        try {
            client.write(`data: ${eventData}\n\n`);
            //console.log("Sent SSE event to client:", data.status, data.message);
        } catch (error) {
            console.error("Error writing to SSE client:", error.message);
            clientsToRemove.push(client);
        }
    });
    
    // Remove dead connections
    clientsToRemove.forEach(client => {
        clients.delete(client);
    });
    
    if (clientsToRemove.length > 0) {
        console.log(`Removed ${clientsToRemove.length} dead SSE connections. Active clients: ${clients.size}`);
    }
}

// Function to get current client count
function getActiveClientCount() {
    return clients.size;
}

module.exports = {
    setupSSEConnection,
    sendEvent,
    getActiveClientCount
};
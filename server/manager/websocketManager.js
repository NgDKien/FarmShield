const WebSocket = require('ws');
const { URLSearchParams } = require('url');

let wssEdge = null;
const connectedEdgeDevices = new Map();
let sseEmitter = null;

function initializeWebSocketServer(server, sseManager) {
    if (wssEdge) {
        console.warn("[WS-Edge Manager] WebSocket server already initialized.");
        return;
    }

    sseEmitter = sseManager;
    wssEdge = new WebSocket.Server({ server, path: '/edge_ws' }); // Listen on /edge_ws

    console.log("🟢 WebSocket Server for edge devices initialized on /edge_ws.");

    wssEdge.on('connection', (ws, request) => {
        console.log("Websocket url: "+request.url);
        const urlParts = request.url.split('?');
        let edgeId = null; 
        if (urlParts.length > 1) {
            const urlParams = new URLSearchParams(urlParts[1]);
            edgeId = urlParams.get('id');
        }

        if (edgeId) {
            console.log(`[WS-Edge Manager] Edge device '${edgeId}' connected.`);
            connectedEdgeDevices.set(edgeId, ws);
        } else {
            console.log("[WS-Edge Manager] Edge device connected without ID. Closing connection.");
            ws.close();
            return;
        }

        ws.on('message', message => {
            console.log(`[WS-Edge Manager] Received from ${edgeId}: ${message}`);
            try {
                const parsedMessage = JSON.parse(message);
                if (sseEmitter) {
                    sseEmitter.sendEvent(parsedMessage);
                }
            } catch (e) {
                console.error(`[WS-Edge Manager] Error parsing message from ${edgeId}: ${e}`);
            }
        });

        ws.on('close', () => {
            if (edgeId) {
                console.log(`[WS-Edge Manager] Edge device '${edgeId}' disconnected.`);
                connectedEdgeDevices.delete(edgeId);
            }
        });

        ws.on('error', error => {
            console.error(`[WS-Edge Manager] Edge device '${edgeId}' error:`, error);
        });
    });
}


function sendCommandToEdgeDevice(edgeId, command) {
    const ws = connectedEdgeDevices.get(edgeId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(`[WS-Edge Manager] Sending command to '${edgeId}': ${JSON.stringify(command)}`);
        ws.send(JSON.stringify(command));
        return { status: "success", message: "Command sent." };
    } else {
        const msg = `Edge device '${edgeId}' not connected or not ready.`;
        console.warn(`[WS-Edge Manager] ${msg}`);
        return { status: "error", message: msg };
    }
}

module.exports = {
    initializeWebSocketServer,
    sendCommandToEdgeDevice,
};

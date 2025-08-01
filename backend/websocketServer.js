// websocketServer.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clientes = new Map(); // idTecnico => WebSocket

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.tipo === 'registro_tecnico') {
      clientes.set(data.idTecnico, ws);
      console.log(`👤 Técnico ${data.idTecnico} conectado`);
    }
  });

  ws.on('close', () => {
    for (const [id, socket] of clientes.entries()) {
      if (socket === ws) {
        clientes.delete(id);
        break;
      }
    }
  });
});

function notificarTecnico(idTecnico, mensaje) {
  const ws = clientes.get(idTecnico);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ tipo: 'notificacion', mensaje }));
  }
}

module.exports = { notificarTecnico };

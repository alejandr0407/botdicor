const http = require('http');
const axios = require('axios');

function startServer() {
  // 🌐 Servidor HTTP básico para satisfacer el chequeo de puerto de Render
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.write('Bot Arkham encendido y operando con éxito.');
    res.end();
  }).listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log(`[Webserver] Servidor HTTP escuchando correctamente.`);
  });

  // 🔄 Sistema de Auto-Ping optimizado
  const APP_URL = 'https://botdicor.onrender.com'; 
  
  setInterval(async () => {
    try {
      // Le añadimos un timeout de 10 segundos para que el bot no se quede colgado si Render va lento
      const res = await axios.get(APP_URL, { timeout: 10000 });
      console.log(`[KeepAlive] Ping de supervivencia exitoso: Status ${res.status}`);
    } catch (err) {
      console.error("[KeepAlive] Alerta en auto-ping:", err.message);
    }
  }, 5 * 60 * 1000); // Se ejecuta cada 5 minutos exactos para garantizar estabilidad
}

module.exports = { startServer };
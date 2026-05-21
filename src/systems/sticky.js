const fs = require('fs');
const STICKY_FILE = './stickies.json';

let stickyMap = new Map();
const stickyMsg = new Map();
const stickyLock = new Set();

// Temporizadores para controlar el tiempo de espera en canales muy activos
const cooldownsActivos = new Map();

if (fs.existsSync(STICKY_FILE)) {
  try {
    const rawData = fs.readFileSync(STICKY_FILE, 'utf-8');
    stickyMap = new Map(Object.entries(JSON.parse(rawData)));
    console.log("✅ Base de datos de Stickies cargada.");
  } catch (err) {
    console.error("❌ Error al leer stickies.json:", err);
  }
}

const guardarEnDisco = () => {
  fs.writeFileSync(STICKY_FILE, JSON.stringify(Object.fromEntries(stickyMap), null, 2));
};

async function handleSticky(message) {
  if (message.author.bot) return;
  const channel = message.channel;

  // ==========================================
  // COMANDO: !stick
  // ==========================================
  if (message.content.startsWith('!stick ')) {
    const text = message.content.slice(7).trim();
    if (!text) return;

    await message.delete().catch(() => {});
    const oldId = stickyMsg.get(channel.id);
    if (oldId) {
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    const sent = await channel.send(`**Fijado:**\n${text}`);
    stickyMap.set(channel.id, text);
    stickyMsg.set(channel.id, sent.id);
    guardarEnDisco();
    return;
  }

  // ==========================================
  // COMANDO: !unstick
  // ==========================================
  if (message.content === '!unstick') {
    const oldId = stickyMsg.get(channel.id);
    if (oldId) {
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    // Limpiar temporizadores de este canal
    if (cooldownsActivos.has(channel.id)) {
      clearTimeout(cooldownsActivos.get(channel.id));
      cooldownsActivos.delete(channel.id);
    }

    stickyMap.delete(channel.id);
    stickyMsg.delete(channel.id);
    guardarEnDisco();

    await message.delete().catch(() => {});
    const info = await channel.send("✅ Sticky desactivado en este canal.");
    setTimeout(() => info.delete().catch(() => {}), 3000);
    return;
  }

  // ==========================================
  // LÓGICA DE REPOSTEO INTELIGENTE
  // ==========================================
  const stickyText = stickyMap.get(channel.id);
  if (!stickyText) return;

  // Si el canal ya está marcado como "muy activo", reiniciamos el cronómetro de 10 minutos.
  // Esto hace que el bot espere a que pasen 10 minutos COMPLETOS de silencio antes de actuar.
  if (cooldownsActivos.has(channel.id)) {
    clearTimeout(cooldownsActivos.get(channel.id));
    
    const timer = setTimeout(async () => {
      cooldownsActivos.delete(channel.id); // El canal ya se calmó
      await moverSticky(channel, stickyText);
    }, 10 * 60 * 1000); // 10 minutos en milisegundos

    cooldownsActivos.set(channel.id, timer);
    return;
  }

  // Si el bot está en medio de un proceso de borrado/envío, ignoramos para no acumular acciones
  if (stickyLock.has(channel.id)) {
    // Si la gente escribe mientras el bot está bloqueado, asumimos que el canal se activó mucho.
    // Activamos el modo de espera de 10 minutos para proteger al bot de penalizaciones de Discord.
    const timer = setTimeout(async () => {
      cooldownsActivos.delete(channel.id);
      await moverSticky(channel, stickyText);
    }, 10 * 60 * 1000);

    cooldownsActivos.set(channel.id, timer);
    return;
  }

  // Si el canal está tranquilo, se mueve de forma normal e inmediata
  await moverSticky(channel, stickyText);
}

// Función auxiliar protegida para borrar el anterior y mandar el nuevo
async function moverSticky(channel, text) {
  stickyLock.add(channel.id);
  try {
    const oldId = stickyMsg.get(channel.id);
    if (oldId) {
      // Intentamos buscar el mensaje; si Discord no lo encuentra (porque alguien lo borró), 
      // el .catch(() => null) evita que el código falle y simplemente nos devuelve null.
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) {
        await oldMsg.delete().catch(() => {});
      }
    }

    const newMsg = await channel.send(`**Fijado:**\n${text}`);
    stickyMsg.set(channel.id, newMsg.id);
  } catch (e) {
    console.error("Error moviendo sticky:", e);
  } finally {
    // Usar 'finally' asegura que el candado siempre se libere, pase lo que pase
    setTimeout(() => stickyLock.delete(channel.id), 3000);
  }
}

module.exports = { handleSticky };
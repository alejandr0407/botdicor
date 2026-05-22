const fs = require('fs');

const STICKY_FILE = './stickies.json';

/*
Estructura guardada:

{
  "CANAL_ID": {
    "text": "mensaje sticky",
    "messageId": "123456789"
  }
}
*/

let stickyMap = new Map();

/*
Canales bloqueados mientras se mueve el sticky
*/
const stickyLock = new Set();

/*
Timers para canales activos
*/
const cooldownsActivos = new Map();


// ======================================================
// CARGAR BASE DE DATOS
// ======================================================

if (fs.existsSync(STICKY_FILE)) {
  try {
    const raw = fs.readFileSync(STICKY_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    stickyMap = new Map(Object.entries(parsed));

    console.log('✅ Stickies cargados.');
  } catch (err) {
    console.error('❌ Error leyendo stickies.json:', err);
  }
}


// ======================================================
// GUARDAR
// ======================================================

function guardarEnDisco() {
  fs.writeFileSync(
    STICKY_FILE,
    JSON.stringify(Object.fromEntries(stickyMap), null, 2)
  );
}


// ======================================================
// FUNCIÓN PRINCIPAL
// ======================================================

async function handleSticky(message) {

  if (message.author.bot) return;

  const channel = message.channel;


  // ======================================================
  // COMANDO: !stick
  // ======================================================

  if (message.content.startsWith('!stick ')) {

    const text = message.content.slice(7).trim();

    if (!text) return;

    await message.delete().catch(() => {});

    /*
    Evitar duplicados mientras se crea
    */
    if (stickyLock.has(channel.id)) return;

    stickyLock.add(channel.id);

    try {

      const oldData = stickyMap.get(channel.id);

      /*
      Borrar sticky anterior
      */
      if (oldData?.messageId) {

        const oldMsg = await channel.messages
          .fetch(oldData.messageId)
          .catch(() => null);

        if (oldMsg) {
          await oldMsg.delete().catch(() => {});
        }
      }

      /*
      Enviar nuevo sticky
      */
      const sent = await channel.send(`**Fijado:**\n${text}`);

      /*
      Guardar
      */
      stickyMap.set(channel.id, {
        text,
        messageId: sent.id
      });

      guardarEnDisco();

    } catch (err) {

      console.error('❌ Error creando sticky:', err);

    } finally {

      stickyLock.delete(channel.id);

    }

    return;
  }


  // ======================================================
  // COMANDO: !unstick
  // ======================================================

  if (message.content === '!unstick') {

    if (stickyLock.has(channel.id)) return;

    stickyLock.add(channel.id);

    try {

      const oldData = stickyMap.get(channel.id);

      /*
      Borrar mensaje sticky
      */
      if (oldData?.messageId) {

        const oldMsg = await channel.messages
          .fetch(oldData.messageId)
          .catch(() => null);

        if (oldMsg) {
          await oldMsg.delete().catch(() => {});
        }
      }

      /*
      Limpiar cooldown
      */
      if (cooldownsActivos.has(channel.id)) {

        clearTimeout(cooldownsActivos.get(channel.id));

        cooldownsActivos.delete(channel.id);
      }

      /*
      Borrar de memoria
      */
      stickyMap.delete(channel.id);

      guardarEnDisco();

      await message.delete().catch(() => {});

      const info = await channel.send(
        '✅ Sticky desactivado en este canal.'
      );

      setTimeout(() => {
        info.delete().catch(() => {});
      }, 3000);

    } catch (err) {

      console.error('❌ Error eliminando sticky:', err);

    } finally {

      stickyLock.delete(channel.id);

    }

    return;
  }


  // ======================================================
  // SI NO HAY STICKY EN EL CANAL
  // ======================================================

  const stickyData = stickyMap.get(channel.id);

  if (!stickyData) return;


  // ======================================================
  // IGNORAR SI EL MENSAJE ES EL STICKY
  // ======================================================

  if (message.id === stickyData.messageId) return;


  // ======================================================
  // SI YA HAY TIMER -> REINICIAR
  // ======================================================

  if (cooldownsActivos.has(channel.id)) {

    clearTimeout(cooldownsActivos.get(channel.id));
  }


  // ======================================================
  // CREAR NUEVO TIMER
  // ======================================================

  const timer = setTimeout(async () => {

    cooldownsActivos.delete(channel.id);

    await moverSticky(channel.id, channel);

  }, 10 * 1000); // 10 segundos (cambia a 10 * 60 * 1000 para 10 minutos)


  cooldownsActivos.set(channel.id, timer);
}


// ======================================================
// MOVER STICKY
// ======================================================

async function moverSticky(channelId, channel) {

  /*
  Evitar doble ejecución
  */
  if (stickyLock.has(channelId)) return;

  stickyLock.add(channelId);

  try {

    const stickyData = stickyMap.get(channelId);

    if (!stickyData) return;

    /*
    Buscar mensaje anterior
    */
    if (stickyData.messageId) {

      const oldMsg = await channel.messages
        .fetch(stickyData.messageId)
        .catch(() => null);

      if (oldMsg) {
        await oldMsg.delete().catch(() => {});
      }
    }

    /*
    Enviar nuevo sticky
    */
    const newMsg = await channel.send(
      `**Fijado:**\n${stickyData.text}`
    );

    /*
    Actualizar ID
    */
    stickyMap.set(channelId, {
      text: stickyData.text,
      messageId: newMsg.id
    });

    guardarEnDisco();

  } catch (err) {

    console.error('❌ Error moviendo sticky:', err);

  } finally {

    stickyLock.delete(channelId);

  }
}


module.exports = {
  handleSticky
};
const fs = require('fs');

const STICKY_FILE = './stickies.json';

/*
Estructura:

{
  "channelId": {
    "text": "mensaje",
    "messageId": "123456789"
  }
}
*/

let stickyMap = new Map();

/*
Canales que actualmente están moviendo sticky
*/
const activeMoves = new Set();

/*
Timers de espera por canal
*/
const inactivityTimers = new Map();

/*
Tiempo de espera:
5 minutos
*/
const INACTIVITY_TIME = 5 * 60 * 1000;


// ======================================================
// CARGAR ARCHIVO
// ======================================================

if (fs.existsSync(STICKY_FILE)) {

  try {

    const raw = fs.readFileSync(STICKY_FILE, 'utf8');

    stickyMap = new Map(
      Object.entries(JSON.parse(raw))
    );

    console.log('✅ Stickies cargados.');

  } catch (err) {

    console.error('❌ Error cargando stickies:', err);

  }
}


// ======================================================
// GUARDAR
// ======================================================

function saveStickies() {

  fs.writeFileSync(
    STICKY_FILE,
    JSON.stringify(
      Object.fromEntries(stickyMap),
      null,
      2
    )
  );
}


// ======================================================
// HANDLER PRINCIPAL
// ======================================================

async function handleSticky(message) {

  try {

    if (!message.guild) return;

    if (message.author.bot) return;

    const channel = message.channel;

    const channelId = channel.id;


    // ======================================================
    // COMANDO !stick
    // ======================================================

    if (message.content.startsWith('!stick ')) {

      const text = message.content.slice(7).trim();

      if (!text) return;

      await message.delete().catch(() => {});

      /*
      Esperar si el canal está ocupado
      */
      if (activeMoves.has(channelId)) return;

      activeMoves.add(channelId);

      try {

        /*
        Eliminar sticky viejo
        */
        const oldData = stickyMap.get(channelId);

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
        const sent = await channel.send(
          `📌 **Fijado:**\n${text}`
        );

        /*
        Guardar
        */
        stickyMap.set(channelId, {
          text,
          messageId: sent.id
        });

        saveStickies();

      } catch (err) {

        console.error('❌ Error creando sticky:', err);

      } finally {

        activeMoves.delete(channelId);

      }

      return;
    }


    // ======================================================
    // COMANDO !unstick
    // ======================================================

    if (message.content === '!unstick') {

      /*
      Cancelar timer
      */
      if (inactivityTimers.has(channelId)) {

        clearTimeout(inactivityTimers.get(channelId));

        inactivityTimers.delete(channelId);
      }

      /*
      Esperar si está ocupado
      */
      if (activeMoves.has(channelId)) return;

      activeMoves.add(channelId);

      try {

        const oldData = stickyMap.get(channelId);

        /*
        Borrar sticky actual
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
        Borrar datos
        */
        stickyMap.delete(channelId);

        saveStickies();

        await message.delete().catch(() => {});

        const confirm = await channel.send(
          '✅ Sticky eliminado.'
        );

        setTimeout(() => {

          confirm.delete().catch(() => {});

        }, 3000);

      } catch (err) {

        console.error('❌ Error eliminando sticky:', err);

      } finally {

        activeMoves.delete(channelId);

      }

      return;
    }


    // ======================================================
    // SI EL CANAL NO TIENE STICKY
    // ======================================================

    const stickyData = stickyMap.get(channelId);

    if (!stickyData) return;


    // ======================================================
    // IGNORAR EL MENSAJE STICKY
    // ======================================================

    if (message.id === stickyData.messageId) return;


    // ======================================================
    // SI YA HAY UN TIMER -> REINICIAR
    // ======================================================

    if (inactivityTimers.has(channelId)) {

      clearTimeout(
        inactivityTimers.get(channelId)
      );
    }


    // ======================================================
    // CREAR NUEVO TIMER
    // ======================================================

    const timer = setTimeout(async () => {

      await moveSticky(channel);

    }, INACTIVITY_TIME);

    inactivityTimers.set(channelId, timer);

  } catch (err) {

    console.error('❌ Error general sticky:', err);

  }
}


// ======================================================
// MOVER STICKY
// ======================================================

async function moveSticky(channel) {

  const channelId = channel.id;

  /*
  Evitar doble ejecución
  */
  if (activeMoves.has(channelId)) return;

  activeMoves.add(channelId);

  try {

    const stickyData = stickyMap.get(channelId);

    if (!stickyData) return;


    // ======================================================
    // BORRAR MENSAJE ANTERIOR
    // ======================================================

    if (stickyData.messageId) {

      const oldMsg = await channel.messages
        .fetch(stickyData.messageId)
        .catch(() => null);

      if (oldMsg) {

        await oldMsg.delete().catch(() => {});
      }
    }


    // ======================================================
    // ENVIAR NUEVO STICKY
    // ======================================================

    const newMsg = await channel.send(
      `📌 **Fijado:**\n${stickyData.text}`
    );


    // ======================================================
    // ACTUALIZAR ID
    // ======================================================

    stickyMap.set(channelId, {
      text: stickyData.text,
      messageId: newMsg.id
    });

    saveStickies();

  } catch (err) {

    console.error('❌ Error moviendo sticky:', err);

  } finally {

    activeMoves.delete(channelId);

  }
}


module.exports = {
  handleSticky
};
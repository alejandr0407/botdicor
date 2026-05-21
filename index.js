const { Client, IntentsBitField, Events } = require('discord.js');
require("dotenv").config();

// 📁 IMPORTACIÓN DE MÓDULOS
const { startServer } = require('./src/systems/server');
const { handleSticky } = require('./src/systems/sticky');
const { ejecutarRoleplay, manejarBotonesRoleplay } = require('./src/commands/roleplay');
const { ejecutarVerificacion } = require('./src/systems/verificarPlazos');

// 🌐 Encender el servidor
startServer();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers
  ]
});

// Evento de inicio
client.once(Events.ClientReady, (c) => {
  console.log(`🤖 ¡Bot Arkham operativo! Conectado como: ${c.user.tag}`);
});

// Manejo de mensajes (Sticky)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  try {
    await handleSticky(message);
  } catch (err) {
    console.error("Error en Sticky:", err);
  }
});

// Manejo de interacciones
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // 1. Manejo de comandos "/"
    if (interaction.isChatInputCommand()) {

      switch (interaction.commandName) {

        case 'roleplay':
          await ejecutarRoleplay(interaction);
          break;

        case 'verificar_plazos':
          await ejecutarVerificacion(interaction);
          break;

        default:
          console.log(`Comando no reconocido: ${interaction.commandName}`);
      }
    }

    // 2. Manejo de botones
    else if (interaction.isButton()) {

      const { customId } = interaction;

      // Roleplay
      if (['r1', 'r2', 'r3'].includes(customId)) {
        await manejarBotonesRoleplay(interaction);
      }
    }

  } catch (error) {

    console.error("Error global en InteractionCreate:", error);

    if (interaction.isRepliable()) {
      await interaction.reply({
        content: 'Ocurrió un error inesperado al procesar esta acción.',
        ephemeral: true
      }).catch(() => {});
    }
  }
});

client.login(process.env.TOKEN);
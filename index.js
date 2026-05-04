const http = require('http');
const fs = require('fs');
require("dotenv").config();

// =========================
// 🌐 SERVIDOR HTTP (Para Render)
// =========================
http.createServer((req, res) => {
  res.write('Bot Arkham encendido');
  res.end();
}).listen(process.env.PORT || 3000, '0.0.0.0');

const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

// =========================
// 🔵 CLIENTE
// =========================
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers
  ]
});

// 🎨 CONFIGURACIÓN VISUAL
const COLOR = 0x0c2a40;

// 🎭 GRUPOS DE ROLES
const rolesGrupo1 = [
  { id: "1484745460135624826", nombre: "ᴍᴇᴅɪᴄᴏꜱ" },
  { id: "1484745682211569755", nombre: "ᴇɴꜰᴇʀᴍᴇʀᴏꜱ" },
  { id: "1484745738419310653", nombre: "ꜱᴇɢᴜʀɪᴅᴀᴅ" },
  { id: "1499475668843364393", nombre: "ɪɴᴛᴇʀɴᴏꜱ" }
];

const rolesGrupo2 = [
  { id: "1499476686545227878", nombre: "ɪɴᴇꜱᴛᴀʙʟᴇ" },
  { id: "1499476614839275702", nombre: "ᴛʀᴀᴛᴀʙʟᴇ" }
];

// 🔒 CONTROL DE ESTADOS
let usuarioActivo = null;
let uso1 = false;
let uso2 = false;
let mensajePanel = null;

// =========================
// 💾 SISTEMA DE PERSISTENCIA (STICKY)
// =========================
const STICKY_FILE = './stickies.json';
let stickyMap = new Map();
const stickyMsg = new Map();
const stickyLock = new Set();

// Cargar datos al iniciar el bot
if (fs.existsSync(STICKY_FILE)) {
  try {
    const rawData = fs.readFileSync(STICKY_FILE, 'utf-8');
    const jsonData = JSON.parse(rawData);
    stickyMap = new Map(Object.entries(jsonData));
    console.log("✅ Base de datos de Stickies cargada.");
  } catch (err) {
    console.error("❌ Error al leer stickies.json:", err);
  }
}

// Función para guardar cambios en el archivo
const guardarEnDisco = () => {
  const dataObject = Object.fromEntries(stickyMap);
  fs.writeFileSync(STICKY_FILE, JSON.stringify(dataObject, null, 2));
};

// =========================
// 🟢 EVENTO: READY
// =========================
client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

// =========================
// ⚙️ COMANDO: ROLEPLAY
// =========================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'roleplay') {
    usuarioActivo = null;
    uso1 = false;
    uso2 = false;

    const grupo1Texto = rolesGrupo1.map(r => r.nombre).join(", ");
    const grupo2Texto = rolesGrupo2.map(r => r.nombre).join(", ");

    const embed = new EmbedBuilder()
      .setTitle("ʀᴏʟᴇs ᴀʟᴇᴀᴛᴏʀɪᴏs ᴀʀᴋ4ʜᴀᴍ")
      .setColor(COLOR)
      .setDescription(
`-# Por favor, haz clic en los botones para recibir tus roles. Estos son necesarios para tu backstory y aparecerán de forma permanente en tu perfil.

_ _
**ʀᴏʟ 1:**
_ _ ${grupo1Texto}

**ʀᴏʟ 2:**
_ _ ${grupo2Texto}`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('r1').setLabel('ʀᴏʟ 1').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('r2').setLabel('ʀᴏʟ 2').setStyle(ButtonStyle.Secondary)
    );

    mensajePanel = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });
  }
});

// =========================
// 🔘 LÓGICA DE BOTONES
// =========================
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (!usuarioActivo) usuarioActivo = interaction.user.id;

  if (interaction.user.id !== usuarioActivo) {
    return interaction.reply({
      content: "Solo una persona puede usar este panel",
      ephemeral: true
    });
  }

  const member = interaction.member;

  if (interaction.customId === 'r1' && !uso1) {
    const rol = rolesGrupo1[Math.floor(Math.random() * rolesGrupo1.length)];
    await member.roles.add(rol.id).catch(console.error);
    uso1 = true;

    await interaction.reply({
      content: `　　"   𝖠𝖧ᝪ𝖱𝖠 𝖤𝖱𝖤𝖲 𝖯𝖠𝖱Τ𝖤 𝖣𝖤 :   "
_ _      **${rol.nombre}**
_ _
-# ʀᴇᴄᴜᴇʀᴅᴀ ǫᴜᴇ ᴛᴜs ʀᴏʟᴇs ɴᴏ sᴇ ᴄᴀᴍʙɪᴀɴ, ᴀ ᴍᴇɴᴏs ǫᴜᴇ ʙᴏᴏsᴛᴇᴇs ᴇʟ sᴇʀᴠɪᴅᴏʀ.`,
      ephemeral: true
    });
  }

  if (interaction.customId === 'r2' && !uso2) {
    const rol = rolesGrupo2[Math.floor(Math.random() * rolesGrupo2.length)];
    await member.roles.add(rol.id).catch(console.error);
    uso2 = true;

    await interaction.reply({
      content: `　　"   𝖠𝖧ᝪ𝖱𝖠 𝖤𝖱𝖤𝖲 𝖯𝖠𝖱Τ𝖤 𝖣𝖤 :   "
_ _      **${rol.nombre}**
_ _
-# ʀᴇᴄᴜᴇʀᴅᴀ ǫᴜᴇ ᴛᴜs ʀᴏʟᴇs ɴᴏ sᴇ ᴄᴀᴍʙɪᴀɴ, ᴀ ᴍᴇɴᴏs ǫᴜᴇ ʙᴏᴏsᴛᴇᴇs ᴇʟ sᴇʀᴠɪᴅᴏʀ.`,
      ephemeral: true
    });
  }

  if (uso1 && uso2 && mensajePanel) {
    setTimeout(() => {
      mensajePanel.delete().catch(() => {});
    }, 2500);
  }
});

// =========================
// 📌 STICKY SYSTEM (PRO)
// =========================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const channel = message.channel;

  // Comando !stick
  if (message.content.startsWith('!stick ')) {
    const text = message.content.slice(7).trim();
    if (!text) return;

    await message.delete().catch(() => {});

    // Limpiar anterior si existe
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

  // Comando !unstick
  if (message.content === '!unstick') {
    const oldId = stickyMsg.get(channel.id);
    if (oldId) {
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    stickyMap.delete(channel.id);
    stickyMsg.delete(channel.id);
    guardarEnDisco();

    await message.delete().catch(() => {});
    const info = await channel.send("✅ Sticky desactivado en este canal.");
    setTimeout(() => info.delete().catch(() => {}), 3000);
    return;
  }

  // Lógica de Reposteo
  const stickyText = stickyMap.get(channel.id);
  if (!stickyText || stickyLock.has(channel.id)) return;

  stickyLock.add(channel.id);

  try {
    const oldId = stickyMsg.get(channel.id);
    if (oldId) {
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    const newMsg = await channel.send(`**Fijado:**\n${stickyText}`);
    stickyMsg.set(channel.id, newMsg.id);
  } catch (e) {
    console.error("Error moviendo sticky:", e);
  } finally {
    // Evita que el bot se sature si hay muchos mensajes rápidos
    setTimeout(() => stickyLock.delete(channel.id), 2000);
  }
});

const axios = require('axios');

const APP_URL = 'https://botdicor.onrender.com'; 

setInterval(async () => {
  try {
    const res = await axios.get(APP_URL);
    console.log(`Ping de supervivencia enviado: Status ${res.status}`);
  } catch (err) {
    console.error("Error en el auto-ping:", err.message);
  }
}, 13 * 60 * 1000);

client.login(process.env.TOKEN);
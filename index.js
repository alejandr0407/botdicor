const http = require('http');

http.createServer((req, res) => {
  res.write('Bot encendido');
  res.end();
}).listen(process.env.PORT || 3000, '0.0.0.0');
require("dotenv").config();

console.log("TOKEN:", process.env.TOKEN);

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

// 🎨 COLOR EMBED
const COLOR = 0x0c2a40;

// 🎭 GRUPOS
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

// =========================
// 🔒 ROLEPLAY CONTROL
// =========================
let usuarioActivo = null;
let uso1 = false;
let uso2 = false;
let mensajePanel = null;

// =========================
// 📌 STICKY SYSTEM
// =========================
const stickyMap = new Map();
const stickyMsg = new Map();
const stickyLock = new Set();

// =========================
// 🟢 READY
// =========================
client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

// =========================
// ⚙️ ROLEPLAY
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
      .setTitle("ʀᴏʟᴇꜱ ᴀʟᴇᴀᴛᴏʀɪᴏꜱ ᴀʀᴋ4ʜᴀᴍ")
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

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    mensajePanel = msg;
  }
});

// =========================
// 🔘 BOTONES
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
    await member.roles.add(rol.id);
    uso1 = true;

    return interaction.reply({
      content: `　　"   𝖠𝖧ᝪ𝖱𝖠 𝖤𝖱𝖤𝖲 𝖯𝖠𝖱Τ𝖤 𝖣𝖤 :   "
_ _      **${rol.nombre}**
-#  ʀᴇᴄᴜᴇʀᴅᴀ ǫᴜᴇ ᴛᴜs ʀᴏʟᴇs ɴᴏ sᴇ ᴄᴀᴍʙɪᴀɴ, ᴀ ᴍᴇɴᴏs ǫᴜᴇ ʙᴏᴏsᴛᴇᴇs ᴇʟ sᴇʀᴠɪᴅᴏʀ.`,
      ephemeral: true
    });
  }

  if (interaction.customId === 'r2' && !uso2) {

    const rol = rolesGrupo2[Math.floor(Math.random() * rolesGrupo2.length)];
    await member.roles.add(rol.id);
    uso2 = true;

    return interaction.reply({
      content: `　　"   𝖠𝖧ᝪ𝖱𝖠 𝖤𝖱𝖤𝖲 𝖯𝖠𝖱Τ𝖤 𝖣𝖤 :   "
_ _      **${rol.nombre}**
-#  ʀᴇᴄᴜᴇʀᴅᴀ ǫᴜᴇ ᴛᴜs ʀᴏʟᴇs ɴᴏ sᴇ ᴄᴀᴍʙɪᴀɴ, ᴀ ᴍᴇɴᴏs ǫᴜᴇ ʙᴏᴏsᴛᴇᴇs ᴇʟ sᴇʀᴠɪᴅᴏʀ.`,
      ephemeral: true
    });
  }

  if (uso1 && uso2 && mensajePanel) {
    setTimeout(() => {
      mensajePanel.delete().catch(() => {});
    }, 2000);
  }
});

// =========================
// 📌 STICKY SYSTEM
// =========================
client.on('messageCreate', async message => {

  if (message.author.bot) return;

  const channel = message.channel;

  // !stick
  if (message.content.startsWith('!stick ')) {

    const text = message.content.slice(7).trim();

    await message.delete().catch(() => {});

    const old = stickyMsg.get(channel.id);

    if (old) {
      const oldMsg = await channel.messages.fetch(old).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    const sent = await channel.send(`**Fijado:**\n${text}`);

    stickyMap.set(channel.id, text);
    stickyMsg.set(channel.id, sent.id);

    return;
  }

  // !unstick
  if (message.content === '!unstick') {

    stickyMap.delete(channel.id);

    const oldId = stickyMsg.get(channel.id);

    if (oldId) {
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    stickyMsg.delete(channel.id);

    await message.delete().catch(() => {});

    const msg = await channel.send("Sticky desactivado");

    setTimeout(() => msg.delete().catch(() => {}), 5000);

    return;
  }

  // REPOST STICKY
  const sticky = stickyMap.get(channel.id);

  if (!sticky) return;
  if (stickyLock.has(channel.id)) return;

  stickyLock.add(channel.id);

  try {

    const oldId = stickyMsg.get(channel.id);

    if (oldId) {
      const oldMsg = await channel.messages.fetch(oldId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    }

    const newMsg = await channel.send(`**Fijado:**\n${sticky}`);

    stickyMsg.set(channel.id, newMsg.id);

  } finally {
    setTimeout(() => stickyLock.delete(channel.id), 1500);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
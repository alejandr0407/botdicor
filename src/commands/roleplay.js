const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

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

// 🔒 CONTROL DE SESIONES
const panelesActivos = new Map();

// Función que se ejecuta al usar /roleplay
async function ejecutarRoleplay(interaction) {
  const grupo1Texto = rolesGrupo1.map(r => r.nombre).join(", ");
  const grupo2Texto = rolesGrupo2.map(r => r.nombre).join(", ");

  const embed = new EmbedBuilder()
    .setTitle("ʀᴏʟᴇs ᴀʟᴇᴀᴛᴏʀɪᴏs ᴀʀᴋ4ʜᴀّم")
    .setColor(COLOR)
    .setDescription(
`-# Por favor, haz clic en los botones para recibir tus roles. Estos son necesarios para tu backstory y aparecerán de forma permanente en tu perfil.

_ _
**ʀᴏʟ 1:**
_ _ ${grupo1Texto}

**ʀᴏʟ 2:**
_ _ ${grupo2Texto}`
    );

  // 🛠️ Tres botones integrados en una sola fila
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('r1').setLabel('ʀᴏʟ 1').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('r2').setLabel('ʀᴏʟ 2').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('r3').setLabel('ᴏʙᴛᴇɴᴇʀ ᴘʟᴀɴᴛɪʟʟᴀ').setStyle(ButtonStyle.Primary)
  );

  const mensaje = await interaction.reply({ 
    embeds: [embed], 
    components: [row],
    fetchReply: true 
  });

  panelesActivos.set(mensaje.id, {
    creadorId: interaction.user.id,
    uso1: false,
    uso2: false
  });
}

// Función que maneja los clics de los botones
async function manejarBotonesRoleplay(interaction) {
  const mensajeId = interaction.message.id;
  const userId = interaction.user.id;
  const member = interaction.member;

  // ==========================================
  // LÓGICA DEL BOTÓN 3 (PLANTILLA - ACCESO LIBRE)
  // ==========================================
  if (interaction.customId === 'r3') {
    const urlPlantilla = 'https://media.discordapp.net/attachments/1484789526365736970/1504319280693383168/AF2D2BDC-191C-4883-ABCE-72B5DAD2D6DA.jpg?ex=6a107141&is=6a0f1fc1&hm=ea9e8a38da5cc4cafac737023207ab6ba802b5ee43d3aeefff33cb6f1e07bd1f&=&format=webp&width=466&height=561';

    const embedPlantilla = new EmbedBuilder()
        .setTitle('EXPEDIENTE DE INTRO')
        .setDescription(
            'Aquí tienes la plantilla para tu intro de roleplay.\n\n' +
            '**Pasos a seguir:**\n' +
            '1. Descarga o guarda la imagen adjunta abajo.\n' +
            '2. Rellena los datos basado en tu personaje.'
        )
        .setColor(COLOR)
        .setImage(urlPlantilla)
        .setFooter({ text: 'Este mensaje es privado y solo tú puedes verlo.' });

    return await interaction.reply({ embeds: [embedPlantilla], ephemeral: true });
  }

  // 1. Verificar si tenemos registrado este panel en memoria para los roles aleatorios
  if (!panelesActivos.has(mensajeId)) {
    return interaction.reply({ 
      content: " Este panel ya expiró o no es válido. Usa `/roleplay` para generar uno nuevo.", 
      ephemeral: true 
    });
  }

  const datosPanel = panelesActivos.get(mensajeId);

  // 2. Validar que SOLO el creador del comando pueda usar los botones de rol
  if (userId !== datosPanel.creadorId) {
    return interaction.reply({ 
      content: " Solo la persona que usó el comando `/roleplay` puede interactuar con estos botones. Usa el comando tú mismo para obtener tus roles.", 
      ephemeral: true 
    });
  }

  // ==========================================
  // LÓGICA DEL BOTÓN 1
  // ==========================================
  if (interaction.customId === 'r1') {
    if (datosPanel.uso1) {
      return interaction.reply({ content: " Ya obtuviste tu primer rol.", ephemeral: true });
    }
    
    const rol = rolesGrupo1[Math.floor(Math.random() * rolesGrupo1.length)];
    await member.roles.add(rol.id).catch(console.error);
    datosPanel.uso1 = true;
    
    let avisoFalta = !datosPanel.uso2 ? "\n _ _ Aún te falta presionar el **ʀᴏʟ 2**." : "";

    await interaction.reply({
      content: `　　"  Ahora eres parte de:  **${rol.nombre}**\n_ _\n-# ʀᴇᴄᴜᴇʀᴅᴀ ǫᴜᴇ ᴛᴜs ʀᴏʟᴇs ɴᴏ sᴇ ᴄᴀᴍʙɪᴀɴ, ᴀ ᴍᴇɴᴏs ǫᴜᴇ ʙᴏᴏsᴛᴇᴇs ᴇʟ sᴇʀᴠɪᴅᴏʀ.${avisoFalta}`,
      ephemeral: true
    });
  }

  // ==========================================
  // LÓGICA DEL BOTÓN 2
  // ==========================================
  if (interaction.customId === 'r2') {
    if (datosPanel.uso2) {
      return interaction.reply({ content: " Ya obtuviste tu segundo rol.", ephemeral: true });
    }
    
    const rol = rolesGrupo2[Math.floor(Math.random() * rolesGrupo2.length)];
    await member.roles.add(rol.id).catch(console.error);
    datosPanel.uso2 = true;
    
    let avisoFalta = !datosPanel.uso1 ? "\n _ _ Aún te falta presionar el **ʀᴏʟ 1**" : "";

    await interaction.reply({
      content: `　　"  Ahora eres parte de: **${rol.nombre}**\n_ _\n-# ʀᴇᴄᴜᴇʀᴅᴀ ǫᴜᴇ ᴛᴜs ʀᴏʟᴇs ɴᴏ sᴇ ᴄᴀᴍʙɪᴀɴ, ᴀ ᴍᴇɴᴏs ǫᴜᴇ ʙᴏᴏsᴛᴇᴇs ᴇʟ sᴇʀᴠɪᴅᴏʀ.${avisoFalta}`,
      ephemeral: true
    });
  }

  // ==========================================
  // CIERRE DEL PANEL
  // ==========================================
  if (datosPanel.uso1 && datosPanel.uso2) {
    panelesActivos.delete(mensajeId);

    setTimeout(async () => {
      try { 
        await interaction.message.delete(); 
      } catch (e) {
        // Ignorar error si ya fue borrado antes
      }
    }, 2500);
  }
}

module.exports = { ejecutarRoleplay, manejarBotonesRoleplay };
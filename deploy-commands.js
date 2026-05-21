const { SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

// 🆔 PEGA AQUÍ LA ID DE TU SERVIDOR
const GUILD_ID = "1484733864734752840"; 

const commands = [
    new SlashCommandBuilder()
        .setName('roleplay')
        .setDescription('Asignación de roles.'),

    new SlashCommandBuilder()
        .setName('verificar_plazos')
        .setDescription('Muestra el reporte.'),

    new SlashCommandBuilder()
        .setName('impostor')
        .setDescription('Inicia una partida del juego del impostor.')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🔄 Sincronizando comandos en el servidor...');

        // Usamos la ID del bot desde el TOKEN para mayor seguridad
        const botId = Buffer.from(process.env.TOKEN.split('.')[0], 'base64').toString();

        await rest.put(
            Routes.applicationGuildCommands(botId, GUILD_ID),
            { body: commands },
        );

        console.log('✅ ¡Comandos registrados: /roleplay, /verificar_plazos y /impostor!');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
})();
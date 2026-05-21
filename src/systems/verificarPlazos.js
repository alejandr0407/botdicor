const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Configuración de IDs obligatorias
const ROL_HISTORIA = "1484751008860082397";
const ROL_REGISTRO = "1484751052363268129";
const CANAL_STAFF = "1484734043118501953";

async function ejecutarVerificacion(interaction) {
    const canalDestino = interaction.guild.channels.cache.get(CANAL_STAFF);
    if (!canalDestino) {
        return interaction.reply({ content: "No se encontró el canal de Staff configurado.", ephemeral: true });
    }

    await interaction.reply({ content: "Clasificando registros de la comunidad...", ephemeral: true });

    try {
        const miembros = await interaction.guild.members.fetch();
        const ahora = new Date();
        
        // Objeto para clasificar usuarios por días
        let mapaDias = {};

        miembros.forEach(miembro => {
            if (miembro.user.bot) return;

            const tieneHistoria = miembro.roles.cache.has(ROL_HISTORIA);
            const tieneRegistro = miembro.roles.cache.has(ROL_REGISTRO);

            // Si ya tiene todo listo, se ignora
            if (tieneHistoria && tieneRegistro) return;

            const tiempoCreado = ahora - miembro.joinedAt;
            const diasEnServidor = Math.floor(tiempoCreado / (1000 * 60 * 60 * 24));

            let faltas = [];
            if (!tieneHistoria) faltas.push("Historia");
            if (!tieneRegistro) faltas.push("Registro");
            const queFalta = faltas.join(" y ");

            if (!mapaDias[diasEnServidor]) {
                mapaDias[diasEnServidor] = [];
            }

            // Guardamos solo el nombre limpio y lo que le falta
            mapaDias[diasEnServidor].push(`👤 **${miembro.displayName}**\n↳ _Falta: ${queFalta}_`);
        });

        // Ordenamos los días disponibles de mayor a menor
        const diasDisponibles = Object.keys(mapaDias)
            .map(Number)
            .sort((a, b) => b - a);

        if (diasDisponibles.length === 0) {
            return await interaction.editReply({ content: "Todos los miembros tienen sus registros al día." });
        }

        // 🛠️ CONSTRUCCIÓN DEL MENÚ DESPLEGABLE (FILTRO)
        const opcionesMenu = diasDisponibles.slice(0, 25).map(dia => {
            const totalPendientes = mapaDias[dia].length;
            const esExpirado = dia >= 7;
            
            return {
                label: `${dia} días en el servidor`,
                description: `${totalPendientes} miembro(s) pendiente(s) — ${esExpirado ? ' PLAZO VENCIDO' : ' EN PLAZO'}`,
                value: dia.toString(),
            };
        });

        const menuFiltro = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('filtrar_dias_plazo')
                .setPlaceholder('Elige por días')
                .addOptions(opcionesMenu)
        );

        // Embed inicial de bienvenida al panel
        const embedInicial = new EmbedBuilder()
            .setTitle('AUDITORÍA DE REGISTROS')
            .setDescription('Utiliza el menú de abajo para filtrar a los usuarios según los días exactos que llevan esperando en el servidor.')
            .setColor(0x0c2a40)
            .addFields({ 
        name: 'Resumen de días con pendientes actuales:', 
        value: diasDisponibles.map(d => `• **${d} días:** ${mapaDias[d].length} usuario(s)`).join('\n') 
})
            .setTimestamp();

        const mensajePanel = await canalDestino.send({
            embeds: [embedInicial],
            components: [menuFiltro]
        });

        await interaction.editReply({ content: `Panel de filtrado desplegado en <#${CANAL_STAFF}>.` });

        // ⏱️ Recolector para manejar las búsquedas del Staff (Activo por 15 minutos)
        const colector = mensajePanel.createMessageComponentCollector({ time: 900000 });

        colector.on('collect', async i => {
            if (i.customId === 'filtrar_dias_plazo') {
                // Validación de seguridad para Staff
                if (!i.member.permissions.has('ManageRoles') && i.user.id !== interaction.user.id) {
                    return i.reply({ content: "No tienes permisos de Staff para usar este filtro.", ephemeral: true });
                }

                const diaSeleccionado = Number(i.values[0]);
                const usuariosFiltrados = mapaDias[diaSeleccionado];
                const esVencido = diaSeleccionado >= 7;

                const embedActualizado = new EmbedBuilder()
                    .setTitle(`FILTRO: USUARIOS CON ${diaSeleccionado} DÍAS`)
                    .setColor(esVencido ? 0x8b0000 : 0x0c2a40)
                    .setDescription(esVencido ? 'Estos miembros ya superaron el límite de 7 días.' : 'Aún tienen tiempo.')
                    .addFields({ name: `Pendientes (${usuariosFiltrados.length}):`, value: usuariosFiltrados.join('\n\n').substring(0, 1024) })
                    .setFooter({ text: `Filtrado por: ${diaSeleccionado} días` })
                    .setTimestamp();

                // Actualizamos el embed con los resultados de la búsqueda manteniendo el menú activo
                await i.update({
                    embeds: [embedActualizado],
                    components: [menuFiltro]
                });
            }
        });

        colector.on('end', () => {
            // Deshabilitar el menú cuando expire el tiempo del comando
            const menuApagado = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('filtrar_dias_plazo_vencido')
                    .setPlaceholder('Este panel de auditoría ha expirado.')
                    .addOptions([{ label: 'Expirado', value: 'null' }])
                    .setDisabled(true)
            );
            mensajePanel.edit({ components: [menuApagado] }).catch(() => {});
        });

    } catch (error) {
        console.error('Error en el panel de filtrado:', error);
        await interaction.editReply({ content: "Ocurrió un error al compilar el panel de filtrado." });
    }
}

module.exports = { ejecutarVerificacion };
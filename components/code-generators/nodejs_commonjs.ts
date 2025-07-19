
import { GeneratedCodeProps } from '../../types';

const generateCommonJSProject = (props: GeneratedCodeProps) => {
    const { botName, botToken, clientId, commands, events, systems, botType, prefix } = props;

    const isSlash = botType === 'slash';

    const generatedFiles: { name: string; content: string }[] = [];
    const systemPackages = new Set<string>();
    const intents = new Set<string>(['Guilds', 'GuildMessages']);

    // --- System-based File Generation ---
    if (systems.welcome.enabled) {
        intents.add('GuildMembers');
        if (systems.welcome.useImage) systemPackages.add('canvas');
        generatedFiles.push({
            name: 'events/welcome.js',
            content: `
const { Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');
${systems.welcome.useImage ? "const { createCanvas, loadImage } = require('canvas');" : ""}

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (!welcomeChannelId) return;
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel || !channel.isTextBased()) return;
        
        const welcomeMessage = (process.env.WELCOME_MESSAGE || 'Welcome {user} to {server}!')
            .replace(/{user}/g, \`\${member.user}\`)
            .replace(/{server}/g, member.guild.name);
        
        ${systems.welcome.useImage ? `
        try {
            const background = await loadImage(process.env.WELCOME_BG_URL || 'https://i.imgur.com/g82B3vT.png');
            const canvas = createCanvas(1024, 500);
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = 'bold 70px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2.5);
            
            ctx.font = 'bold 50px sans-serif';
            ctx.fillText(member.user.username, canvas.width / 2, canvas.height / 1.8);
            
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 125, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            
            const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 256 }));
            ctx.drawImage(avatar, (canvas.width / 2) - 100, 25, 200, 200);

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome-image.png' });
            
            const embed = new EmbedBuilder().setColor('#4f46e5').setDescription(welcomeMessage).setImage('attachment://welcome-image.png').setTimestamp();
            await channel.send({ embeds: [embed], files: [attachment] });
        } catch(err) {
            console.error("Failed to create welcome image:", err);
            await channel.send(welcomeMessage); // Fallback to text
        }` : `
        await channel.send(welcomeMessage);
        `}
    },
};
`.trim()
        });
    }

    if (systems.moderation.enabled) {
        intents.add('GuildMembers');
        const kickCommandContent = `
const { ${isSlash ? 'SlashCommandBuilder' : ''}, PermissionFlagsBits } = require('discord.js');

module.exports = {
    ${isSlash ? 'data:' : 'name:'} ${isSlash ? `new SlashCommandBuilder().setName('kick').setDescription('Kicks a member.').addUserOption(o => o.setName('target').setDescription('The user to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for kick')).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),` : `'kick',`}
    ${!isSlash ? `description: 'Kicks a member from the server.',\n    usage: 'kick <@user> [reason]',` : ''}
    async execute(${isSlash ? 'interaction' : 'message, args'}) {
        const target = ${isSlash ? `interaction.options.getUser('target')` : `message.mentions.users.first()`};
        const reason = ${isSlash ? `interaction.options.getString('reason') ?? 'No reason provided'` : `args.slice(1).join(' ') || 'No reason provided'`};
        
        if (!target) {
            return await ${isSlash ? 'interaction' : 'message'}.reply('Please specify a user to kick.');
        }

        const member = await ${isSlash ? 'interaction' : 'message'}.guild.members.fetch(target.id);
        if (!member.kickable) {
            return await ${isSlash ? 'interaction' : 'message'}.reply({ content: "I can't kick this user.", ephemeral: true });
        }
        
        try {
            await member.kick(reason);
            await ${isSlash ? 'interaction' : 'message'}.reply({ content: \`Kicked \${target.tag} for reason: \${reason}\`, ephemeral: true });
        } catch (error) {
            console.error('Failed to kick member:', error);
            await ${isSlash ? 'interaction' : 'message'}.reply({ content: 'Failed to kick this member.', ephemeral: true });
        }
    },
};
`;

        const banCommandContent = `
const { ${isSlash ? 'SlashCommandBuilder' : ''}, PermissionFlagsBits } = require('discord.js');

module.exports = {
    ${isSlash ? 'data:' : 'name:'} ${isSlash ? `new SlashCommandBuilder().setName('ban').setDescription('Bans a member.').addUserOption(o => o.setName('target').setDescription('The user to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for ban')).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),` : `'ban',`}
    ${!isSlash ? `description: 'Bans a member from the server.',\n    usage: 'ban <@user> [reason]',` : ''}
    async execute(${isSlash ? 'interaction' : 'message, args'}) {
        const target = ${isSlash ? `interaction.options.getUser('target')` : `message.mentions.users.first()`};
        const reason = ${isSlash ? `interaction.options.getString('reason') ?? 'No reason provided'` : `args.slice(1).join(' ') || 'No reason provided'`};
        
        if (!target) {
            return await ${isSlash ? 'interaction' : 'message'}.reply('Please specify a user to ban.');
        }

        const member = await ${isSlash ? 'interaction' : 'message'}.guild.members.fetch(target.id);
        if (!member.bannable) {
            return await ${isSlash ? 'interaction' : 'message'}.reply({ content: "I can't ban this user.", ephemeral: true });
        }
        
        try {
            await member.ban({ reason });
            await ${isSlash ? 'interaction' : 'message'}.reply({ content: \`Banned \${target.tag} for reason: \${reason}\`, ephemeral: true });
        } catch (error) {
            console.error('Failed to ban member:', error);
            await ${isSlash ? 'interaction' : 'message'}.reply({ content: 'Failed to ban this member.', ephemeral: true });
        }
    },
};
`;

        generatedFiles.push(
            { name: 'commands/kick.js', content: kickCommandContent.trim() },
            { name: 'commands/ban.js', content: banCommandContent.trim() }
        );
    }
    
    if (systems.tickets.enabled && isSlash) { // Ticket system only for slash commands for simplicity
        systemPackages.add('discord-html-transcripts');
        generatedFiles.push({
            name: 'events/ticketHandler.js',
            content: `
const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');
const config = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('open-ticket_')) {
                const departmentId = interaction.customId.split('_')[1];
                const dept = config.systems.tickets.departments.find(d => d.id === departmentId);
                
                if (!dept) return await interaction.reply({ content: 'Ticket department not found.', ephemeral: true });

                await interaction.deferReply({ ephemeral: true });

                const ticketChannel = await interaction.guild.channels.create({
                    name: \`\${dept.label.toLowerCase().replace(/\\s/g, '-')}-\${interaction.user.username}\`,
                    type: ChannelType.GuildText,
                    parent: dept.categoryId || null,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
                        ...(dept.supportRoleId ? [{ id: dept.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [])
                    ],
                });

                await interaction.editReply({ content: \`Ticket created: \${ticketChannel}\` });
                
                const welcomeMessage = dept.welcomeMessage.replace('{user}', interaction.user.toString());
                const embed = new EmbedBuilder().setColor('#4f46e5').setTitle(\`Welcome to \${dept.label}\`).setDescription(welcomeMessage).setTimestamp();
                if (dept.imageUrl) embed.setImage(dept.imageUrl);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(\`close-ticket\`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                );

                await ticketChannel.send({ content: \`\${interaction.user}\`, embeds: [embed], components: [row] });
            } else if (interaction.customId === 'close-ticket') {
                await interaction.reply({ content: 'Closing ticket in 5 seconds...', ephemeral: true });

                const transcript = await createTranscript(interaction.channel, { limit: -1, returnType: 'attachment', filename: \`transcript-\${interaction.channel.name}.html\`, saveImages: true, poweredBy: false });
                if (config.systems.tickets.logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(config.systems.tickets.logChannelId);
                    if (logChannel) {
                        await logChannel.send({ content: \`Ticket \${interaction.channel.name} closed by \${interaction.user.tag}\`, files: [transcript] });
                    }
                }
                setTimeout(() => interaction.channel.delete(), 5000);
            }
        } else if (interaction.isStringSelectMenu() && interaction.customId === 'select-ticket-department') {
            const departmentId = interaction.values[0];
            // This is almost identical to the button logic, could be refactored into a function
            const dept = config.systems.tickets.departments.find(d => d.id === departmentId);
            if (!dept) return await interaction.reply({ content: 'Ticket department not found.', ephemeral: true });
            // ... (rest of channel creation logic is the same as the button)
            await interaction.deferReply({ ephemeral: true });
            const ticketChannel = await interaction.guild.channels.create({ name: \`\${dept.label.toLowerCase().replace(/\\s/g, '-')}-\${interaction.user.username}\`, type: ChannelType.GuildText, parent: dept.categoryId || null, permissionOverwrites: [ { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, ...(dept.supportRoleId ? [{ id: dept.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []) ] });
            await interaction.editReply({ content: \`Ticket created for \${dept.label}: \${ticketChannel}\` });
            const welcomeMessage = dept.welcomeMessage.replace('{user}', interaction.user.toString());
            const embed = new EmbedBuilder().setColor('#4f46e5').setTitle(\`Welcome to \${dept.label}\`).setDescription(welcomeMessage);
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close-ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger));
            await ticketChannel.send({ content: \`\${interaction.user}\`, embeds: [embed], components: [row] });
        }
    }
};
`.trim()
        });
        
        generatedFiles.push({
            name: 'commands/setup-tickets.js',
            content: `
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder().setName('setup-tickets').setDescription('Sets up the ticket panel in the current channel.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const { openMethod, openMessage, departments } = config.systems.tickets;

        const embed = new EmbedBuilder().setColor('#4f46e5').setTitle('Support Tickets').setDescription(openMessage || 'Select a department or click the button to open a support ticket.');
        
        const row = new ActionRowBuilder();

        if (openMethod === 'button') {
            row.addComponents(new ButtonBuilder().setCustomId(\`open-ticket_\${departments[0].id}\`).setLabel(departments[0].label || 'Open Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎟️'));
        } else { // menu
            row.addComponents(new StringSelectMenuBuilder().setCustomId('select-ticket-department').setPlaceholder('Select a department...').addOptions(departments.map(dept => ({ label: dept.label, description: dept.description, value: dept.id }))));
        }

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Ticket panel created!', ephemeral: true });
    }
};
`.trim()
        });
    }

    commands.forEach(command => {
        if (isSlash) {
            generatedFiles.push({
                name: `commands/${command.name}.js`,
                content: `
const { SlashCommandBuilder } = require('discord.js');
${command.requiredPackages?.map(pkg => `const ${pkg} = require('${pkg}');`).join('\n') || ''}

module.exports = {
    data: new SlashCommandBuilder()${command.generatedData || `.setName('${command.name}').setDescription('${command.description}')`},
    async execute(interaction) {
        ${command.generatedCode}
    },
};
`.trim()
            });
        } else {
            generatedFiles.push({
                name: `commands/${command.name}.js`,
                content: `
${command.requiredPackages?.map(pkg => `const ${pkg} = require('${pkg}');`).join('\n') || ''}
module.exports = {
    name: '${command.name}',
    description: '${command.description}',
    async execute(message, args) {
        ${command.generatedCode}
    },
};
`.trim()
            });
        }
    });

    events.forEach(event => {
        if (event.name === 'guildMemberAdd' || event.name === 'guildMemberRemove') intents.add('GuildMembers');
        if (event.name === 'messageCreate') intents.add('MessageContent');
        if (event.name === 'voiceStateUpdate') intents.add('GuildVoiceStates');
        
        generatedFiles.push({
            name: `events/${event.name}.js`,
            content: `
const { Events } = require('discord.js');
${event.requiredPackages?.map(pkg => `const ${pkg} = require('${pkg}');`).join('\n') || ''}

module.exports = {
    name: Events.${event.name.charAt(0).toUpperCase() + event.name.slice(1)},
    once: ${event.name === 'ready'},
    async execute(...args) {
        // The first argument is often the client, but we pass it explicitly in the handler.
        // For 'ready', args[0] is the client. For most others, it's the specific event object.
        ${event.generatedCode}
    },
};
`.trim()
        });
    });

    const allPackages = new Set<string>(['discord.js', 'dotenv', ...systemPackages]);
    [...commands, ...events].forEach(item => item.requiredPackages?.forEach(pkg => allPackages.add(pkg)));

    const packageJson = {
        name: botName.toLowerCase().replace(/\s/g, '-'),
        version: '1.0.0',
        main: 'index.js',
        scripts: {
            start: 'node index.js',
            ...(isSlash && { deploy: 'node deploy-commands.js' })
        },
        dependencies: Object.fromEntries(Array.from(allPackages).map(pkg => [pkg, 'latest']))
    };

    const envVars = [
        `BOT_TOKEN=${botToken}`,
        ...(isSlash ? [`CLIENT_ID=${clientId}`] : []),
        ...(!isSlash ? [`PREFIX=${prefix}`] : []),
        ...(systems.welcome.enabled ? [`WELCOME_CHANNEL_ID=${systems.welcome.channelId}`, `WELCOME_MESSAGE=${systems.welcome.message}`, ...(systems.welcome.useImage ? [`WELCOME_BG_URL=${systems.welcome.backgroundImage}`] : [])] : []),
        ...(systems.moderation.enabled && systems.moderation.logChannelId ? [`MOD_LOG_CHANNEL_ID=${systems.moderation.logChannelId}`] : []),
    ];

    const indexJsContent = `
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [${Array.from(intents).map(i => `GatewayIntentBits.${i}`).join(', ')}] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

${isSlash ? `
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});
` : `
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.content.startsWith(process.env.PREFIX)) return;
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;
    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        await message.reply('There was an error executing that command!');
    }
});
`}

client.login(process.env.BOT_TOKEN);
`;

    const deployCommandsJsContent = isSlash ? `
const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(\`Refreshing \${commands.length} application (/) commands.\`);
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log(\`Successfully reloaded \${data.length} commands.\`);
    } catch (error) { console.error(error); }
})();
` : '';
    
    const readmeContent = `# ${botName}
A Discord bot generated by the Discord Bot Generator.

## Setup
1. Fill in your details in the \`.env\` file.
2. Open your terminal and run \`npm install\`.
${isSlash ? '3. Run `npm run deploy` to register your slash commands with Discord.\n4. Run `npm start` to turn the bot on.' : '3. Run `npm start` to turn the bot on.'}

Enjoy your new bot!
`;

    const otherFiles: Record<string, string> = {
        'package.json': JSON.stringify(packageJson, null, 2),
        '.env': envVars.join('\n'),
        'README.md': readmeContent.trim(),
        'index.js': indexJsContent.trim(),
    };

    if (isSlash) {
        otherFiles['deploy-commands.js'] = deployCommandsJsContent.trim();
    }
    
    if (systems.tickets.enabled && isSlash) {
        otherFiles['config.json'] = JSON.stringify({ systems: { tickets: systems.tickets } }, null, 2);
    }

    return { ...otherFiles, generatedFiles };
}

export const generateCommonJSSlashProject = (props: GeneratedCodeProps) => {
    return generateCommonJSProject(props);
};

export const generateCommonJSPrefixProject = (props: GeneratedCodeProps) => {
    return generateCommonJSProject(props);
};

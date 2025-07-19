
import { GeneratedCodeProps } from '../../types';

// This generator is simplified for brevity. A full implementation would be more robust.
// It will only handle the Slash Command case for this refactor.

export const generateTypeScriptSlashProject = (props: GeneratedCodeProps) => {
    const { botName, botToken, clientId, commands, events, systems } = props;

    const generatedFiles: { name: string; content: string }[] = [];
    const systemPackages = new Set<string>();
    const intents = new Set<string>(['Guilds']);

    // --- System-based File Generation ---
    if (systems.welcome.enabled) {
        intents.add('GuildMembers');
        if (systems.welcome.useImage) systemPackages.add('canvas');
        generatedFiles.push({
            name: 'src/events/welcome.ts',
            content: `
import { Events, GuildMember, AttachmentBuilder, EmbedBuilder } from 'discord.js';
${systems.welcome.useImage ? "import { createCanvas, loadImage } from 'canvas';" : ""}
import { BotEvent } from '../types';

const event: BotEvent = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
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
export default event;
`.trim()
        });
    }

     if (systems.moderation.enabled) {
        generatedFiles.push(
            {
                name: 'src/commands/kick.ts',
                content: `
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';

const command: BotCommand = {
    data: new SlashCommandBuilder().setName('kick').setDescription('Kicks a member.').addUserOption(o => o.setName('target').setDescription('The user to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for kick')).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser('target')!;
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild!.members.fetch(target.id);
        if (!member.kickable) return interaction.reply({ content: "I can't kick this user.", ephemeral: true });
        await member.kick(reason);
        await interaction.reply({ content: \`Kicked \${target.tag}\`, ephemeral: true });
    },
};
export default command;
`.trim()
            },
            {
                name: 'src/commands/ban.ts',
                content: `
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { BotCommand } from '../types';

const command: BotCommand = {
    data: new SlashCommandBuilder().setName('ban').setDescription('Bans a member.').addUserOption(o => o.setName('target').setDescription('The user to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for ban')).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser('target')!;
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        await interaction.guild!.bans.create(target, { reason });
        await interaction.reply({ content: \`Banned \${target.tag}\`, ephemeral: true });
    },
};
export default command;
`.trim()
            }
        );
    }
    
    // This is a simplified version for brevity. A full ticket system is complex.
    if (systems.tickets.enabled) {
        generatedFiles.push({
            name: 'src/events/ticketHandler.ts',
            content: `
import { Events, Interaction } from 'discord.js';
import { BotEvent } from '../types';
// In a real scenario, you'd have more robust logic here
const event: BotEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId.startsWith('open-ticket')) {
            await interaction.reply({ content: 'Ticket system logic would go here.', ephemeral: true });
        }
    },
};
export default event;
`.trim()
        });
    }

    // --- User-defined Command & Event Generation ---
    commands.forEach(command => {
        generatedFiles.push({
            name: `src/commands/${command.name}.ts`,
            content: `
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { BotCommand } from '../types';
${command.requiredPackages?.map(pkg => `import ${pkg} from '${pkg}';`).join('\n') || ''}

const command: BotCommand = {
    data: new SlashCommandBuilder()${command.generatedData || `.setName('${command.name}').setDescription('${command.description}')`},
    async execute(interaction: ChatInputCommandInteraction) {
        ${command.generatedCode}
    },
};
export default command;
`.trim()
        });
    });

    events.forEach(event => {
        const eventEnumName = event.name === 'ready'
            ? 'ClientReady'
            : event.name.charAt(0).toUpperCase() + event.name.slice(1);

        generatedFiles.push({
            name: `src/events/${event.name}.ts`,
            content: `
import { Events } from 'discord.js';
import { BotEvent } from '../types';
${event.requiredPackages?.map(pkg => `import ${pkg} from '${pkg}';`).join('\n') || ''}

const event: BotEvent = {
    name: Events.${eventEnumName},
    once: ${event.name === 'ready'},
    async execute(...args: any[]) {
        ${event.generatedCode}
    },
};
export default event;
`.trim()
        });
    });
    
    // Always include a generic interactionCreate handler for commands
    if (!generatedFiles.some(f => f.name === 'src/events/interactionCreate.ts')) {
         generatedFiles.push({
            name: 'src/events/interactionCreate.ts',
            content: `
import { Events, Interaction } from 'discord.js';
import { BotEvent } from '../types';
import { BotClient } from '../index';

const event: BotEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        const client = interaction.client as BotClient;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Error executing command.', ephemeral: true });
        }
    },
};
export default event;
`.trim()
        });
    }

    const allPackages = new Set<string>(['discord.js', 'dotenv', ...systemPackages]);
    [...commands, ...events].forEach(item => item.requiredPackages?.forEach(pkg => allPackages.add(pkg)));

    const otherFiles: Record<string, string> = {
        'package.json': JSON.stringify({
            name: botName.toLowerCase().replace(/\s/g, '-'), version: '1.0.0', main: 'dist/index.js',
            scripts: { start: 'node dist/index.js', dev: 'ts-node-dev --respawn src/index.ts', build: 'tsc', deploy: 'ts-node src/deploy-commands.ts' },
            dependencies: Object.fromEntries(Array.from(allPackages).map(pkg => [pkg, 'latest'])),
            devDependencies: { typescript: '^5.3.3', 'ts-node-dev': '^2.0.0', 'ts-node': '^10.9.2', '@types/node': '^20.11.24' }
        }, null, 2),
        'tsconfig.json': JSON.stringify({
            compilerOptions: { target: 'ES2022', module: 'CommonJS', moduleResolution: 'node', resolveJsonModule: true, rootDir: './src', outDir: './dist', esModuleInterop: true, strict: true },
            include: ['src/**/*'],
        }, null, 2),
        '.env': [
            `BOT_TOKEN=${botToken}`, `CLIENT_ID=${clientId}`,
            ...(systems.welcome.enabled ? [`WELCOME_CHANNEL_ID=${systems.welcome.channelId}`, `WELCOME_MESSAGE=${systems.welcome.message}`, ...(systems.welcome.useImage ? [`WELCOME_BG_URL=${systems.welcome.backgroundImage}`] : [])] : [])
        ].join('\n'),
        'src/types.ts': `
import { SlashCommandBuilder, ChatInputCommandInteraction, ClientEvents } from 'discord.js';
export interface BotCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
export interface BotEvent {
    name: keyof ClientEvents;
    once?: boolean;
    execute: (...args: any[]) => Promise<void> | void;
}
        `.trim(),
        'src/index.ts': `
import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { BotCommand, BotEvent } from './types';

export class BotClient extends Client {
    public commands = new Collection<string, BotCommand>();
}

const client = new BotClient({ intents: [${Array.from(intents).map(i => `GatewayIntentBits.${i}`).join(', ')}] });

// Command Handler
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
    const command: BotCommand = require(path.join(commandsPath, file)).default;
    client.commands.set(command.data.name, command);
}

// Event Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of eventFiles) {
    const event: BotEvent = require(path.join(eventsPath, file)).default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.BOT_TOKEN);
`.trim(),
        'src/deploy-commands.ts': `
import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { BotCommand } from './types';

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const command: BotCommand = require(path.join(commandsPath, file)).default;
    commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.BOT_TOKEN!);

(async () => {
    try {
        console.log(\`Refreshing \${commands.length} application (/) commands.\`);
        const data: any = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands },
        );
        console.log(\`Successfully reloaded \${data.length} commands.\`);
    } catch (error) { console.error(error); }
})();
`.trim(),
        'README.md': `# Welcome to ${botName}!\n\nThis bot was generated using the Discord Bot Generator.\n\n## Setup\n1. Fill in your details in the \`.env\` file.\n2. Run \`npm install\` in your terminal.\n3. Run \`npm run deploy\` to register slash commands.\n4. To run in development with auto-restarting, use \`npm run dev\`.\n5. To build and run for production, use \`npm run build\` then \`npm run start\`.`
    };
    
    if (systems.tickets.enabled) {
        otherFiles['src/config.json'] = JSON.stringify({ systems: { tickets: systems.tickets } }, null, 2);
    }
    
    return { ...otherFiles, generatedFiles };
};

// Prefix-based TS project generator is not part of this refactor for brevity.
export const generateTypeScriptPrefixProject = (props: GeneratedCodeProps) => {
    return generateTypeScriptSlashProject(props); // Fallback to slash
};

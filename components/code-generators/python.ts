
import { GeneratedCodeProps } from '../../types';

// =======================================================================================
// PYTHON (discord.py) PROJECT GENERATION
// =======================================================================================

export const generatePythonProject = (props: GeneratedCodeProps) => {
    const { botName, botToken, commands, events, systems } = props;

    const generatedFiles: { name: string; content: string }[] = [];
    const intents = new Set(['default']); // discord.Intents.default()
    
    if (systems.welcome.enabled) {
        intents.add('members');
        generatedFiles.push({
            name: 'cogs/system_welcome.py',
            content: `
import discord
from discord.ext import commands
import os

class Welcome(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        channel_id_str = os.getenv("WELCOME_CHANNEL_ID", "${systems.welcome.channelId}")
        if not channel_id_str:
            return
            
        try:
            channel_id = int(channel_id_str)
        except ValueError:
            print(f"Invalid Welcome Channel ID: {channel_id_str}")
            return

        channel = self.bot.get_channel(channel_id)
        if isinstance(channel, discord.TextChannel):
            message = (os.getenv("WELCOME_MESSAGE", "${systems.welcome.message}")
                .replace("{user}", member.mention)
                .replace("{server}", member.guild.name))
            await channel.send(message)

async def setup(bot: commands.Bot):
    await bot.add_cog(Welcome(bot))
`.trim(),
        });
    }

    if (systems.moderation.enabled) {
         generatedFiles.push(
            {
                name: 'cogs/system_kick.py',
                content: `
import discord
from discord.ext import commands
from discord import app_commands

class ModerationKick(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="kick", description="Kicks a member from the server.")
    @app_commands.describe(target="The member to kick", reason="Reason for kicking")
    @app_commands.checks.has_permissions(kick_members=True)
    async def kick(self, interaction: discord.Interaction, target: discord.Member, reason: str = "No reason provided"):
        if interaction.user.top_role <= target.top_role and interaction.guild.owner != interaction.user:
            return await interaction.response.send_message("You cannot kick someone with an equal or higher role.", ephemeral=True)
        
        await target.kick(reason=reason)
        await interaction.response.send_message(f"Successfully kicked {target.mention} for: {reason}")

async def setup(bot: commands.Bot):
    await bot.add_cog(ModerationKick(bot))
`.trim()
            },
            {
                name: 'cogs/system_ban.py',
                content: `
import discord
from discord.ext import commands
from discord import app_commands

class ModerationBan(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="ban", description="Bans a member from the server.")
    @app_commands.describe(target="The member to ban", reason="Reason for banning")
    @app_commands.checks.has_permissions(ban_members=True)
    async def ban(self, interaction: discord.Interaction, target: discord.Member, reason: str = "No reason provided"):
        if interaction.user.top_role <= target.top_role and interaction.guild.owner != interaction.user:
            return await interaction.response.send_message("You cannot ban someone with an equal or higher role.", ephemeral=True)

        await target.ban(reason=reason)
        await interaction.response.send_message(f"Successfully banned {target.mention} for: {reason}")

async def setup(bot: commands.Bot):
    await bot.add_cog(ModerationBan(bot))
`.trim()
            }
        );
    }
     if (systems.tickets.enabled) {
        // NOTE: discord.py ticket system is complex and better suited for a dedicated template.
        // This is a placeholder.
        generatedFiles.push({
            name: 'cogs/system_tickets.py',
            content: `
import discord
from discord.ext import commands
from discord import app_commands

class Tickets(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
    
    @app_commands.command(name="setup-tickets", description="Sets up the ticket panel (placeholder).")
    @app_commands.checks.has_permissions(administrator=True)
    async def setup_tickets(self, interaction: discord.Interaction):
        await interaction.response.send_message("The Python ticket system is a complex feature. This is a placeholder for future implementation.", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(Tickets(bot))
`.trim(),
        });
    }

    // Process user-defined commands
    commands.forEach(command => {
        generatedFiles.push({
            name: `cogs/${command.name}.py`,
            content: command.generatedCode.trim(),
        });
    });

    // Process user-defined events
    events.forEach(event => {
        generatedFiles.push({
            name: `cogs/event_${event.name}.py`,
            content: event.generatedCode.trim(),
        });
    });

    const allItems = [...commands, ...events];
    const requiredPackages = new Set<string>(['discord.py', 'python-dotenv']);
    allItems.forEach(item => item.requiredPackages?.forEach(pkg => requiredPackages.add(pkg)));

    // Set necessary intents for events
    if (events.some(e => e.name === 'messageCreate')) intents.add('messages').add('message_content');
    if (events.some(e => e.name === 'guildMemberAdd' || e.name === 'guildMemberRemove')) intents.add('members');
    if (events.some(e => e.name === 'voiceStateUpdate')) intents.add('voice_states');


    const intentString = Array.from(intents).map(i => `intents.${i} = True`).join('\n        ');

    const envVariables = [
        `BOT_TOKEN=${botToken}`,
        ...(systems.welcome.enabled ? [`WELCOME_CHANNEL_ID=${systems.welcome.channelId}`, `WELCOME_MESSAGE=${systems.welcome.message}`] : []),
    ];

    const files = {
        'requirements.txt': Array.from(requiredPackages).join('\n'),
        '.env': envVariables.join('\n'),
        'main.py': `
import os
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

class MyBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        ${intentString}
        
        super().__init__(
            command_prefix="!", # Not used for slash commands
            intents=intents
        )

    async def setup_hook(self):
        cogs_folder = "cogs"
        if not os.path.exists(cogs_folder):
            os.makedirs(cogs_folder)
            
        for filename in os.listdir(f'./{cogs_folder}'):
            if filename.endswith(".py"):
                try:
                    await self.load_extension(f"{cogs_folder}.{filename[:-3]}")
                    print(f"Loaded cog: {filename}")
                except Exception as e:
                    print(f"Failed to load cog {filename}: {e}")
        
        try:
            # Sync commands to a specific guild for faster testing, or globally
            # self.tree.copy_global_to(guild=discord.Object(id=YOUR_GUILD_ID))
            synced = await self.tree.sync()
            print(f"Synced {len(synced)} command(s)")
        except Exception as e:
            print(f"Failed to sync commands: {e}")

    async def on_ready(self):
        print(f"Logged in as {self.user} (ID: {self.user.id})")
        print("------")

async def main():
    if BOT_TOKEN is None:
        print("Error: BOT_TOKEN is not set in the .env file.")
        return
        
    bot = MyBot()
    await bot.start(BOT_TOKEN)

if __name__ == "__main__":
    asyncio.run(main())
`.trim(),
        'README.md': `
# Welcome to ${botName}! (Python)

This project was generated using the **Discord Bot Generator**. This guide will help you get your bot running in a few simple steps.

## 🚀 File Structure

-   \`main.py\`: This is the main file that runs your bot.
-   \`cogs/\`: This folder contains all your commands and event listeners. Each file represents a "Cog", which is a collection of related commands/events.
-   \`requirements.txt\`: This file lists all the Python libraries your bot needs to function.
-   \`.env\`: A file for your sensitive variables like your bot token. **Do not share this file with anyone!**
-   \`discord-bot-generator.json\`: A special configuration file for the generator. You can use this to re-import your project back into the website to modify it later.

## 🛠️ Setup and Running Steps

### 1. Prerequisites
Make sure you have **Python 3.8** or newer installed on your system.

### 2. Setting up a Virtual Environment (Recommended)
A virtual environment helps to isolate project libraries from the rest of your system.

-   To create the environment:
    \`\`\`bash
    python -m venv venv
    \`\`\`
-   To activate the environment:
    -   **Windows:** \`venv\\Scripts\\activate\`
    -   **Linux/macOS:** \`source venv/bin/activate\`

### 3. Installing Libraries
Install all the required libraries from the \`requirements.txt\` file.

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Setting up the Token
1.  Open the \`.env\` file.
2.  You will find a line that says: \`BOT_TOKEN=\`.
3.  Paste your actual bot token after the equals sign. You can get this from the [Discord Developer Portal](https://discord.com/developers/applications).

### 5. Running the Bot
Now, everything is ready! Run the bot using the following command:

\`\`\`bash
python main.py
\`\`\`

If everything is correct, you will see a message in your terminal confirming that the bot has logged in successfully.

## 🔄 Re-importing the Project
Keep the \`discord-bot-generator.json\` file safe! If you upload your project to GitHub, you can use the repository link to re-import your entire configuration back into the Discord Bot Generator and continue editing it.
`.trim(),
    };

    return { ...files, generatedFiles };
};

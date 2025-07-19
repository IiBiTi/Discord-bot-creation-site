

import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCodeProps } from "../types";
import { TranslationKeys } from "../translations";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createSlashPrompt = (action: string, commandName: string, commandDescription: string) => `
You are an expert discord.js v14 programmer specializing in creating slash commands.
Your task is to analyze a user's request and generate the necessary JSON output to create a complete slash command file.

The user's natural language request for what the command should do is: "${action}"
The command's name is: "${commandName}"
The command's description is: "${commandDescription}"

**Analysis and Generation Steps:**

1.  **Analyze Request for Options:** Carefully read the user's request ("${action}"). Identify if the command needs any arguments (options).
    *   Supported option types are: \`String\`, \`Integer\`, \`Boolean\`, \`User\`, \`Channel\`, \`Role\`, \`Mentionable\`.
    *   For each option, determine its \`name\` (lowercase, no spaces), a clear \`description\`, and whether it is \`required\`.

2.  **Analyze Request for Packages:** Analyze the request to see if it requires any external npm packages to function.
    *   For example, if the request is "fetch data from an API", it needs \`axios\` or \`node-fetch\`.
    *   List these packages in the \`requiredPackages\` array. Only include packages that need to be imported with \`require()\`. Do NOT include \`discord.js\` or \`dotenv\`.

3.  **Generate \`commandData\`:**
    *   Create the JavaScript code for the \`SlashCommandBuilder\` method chain.
    *   Start with \`.setName('${commandName}').setDescription('${commandDescription}')\`.
    *   For each identified option, append the corresponding method, e.g., \`.addStringOption(option => option.setName('name').setDescription('description').setRequired(true))\`.
    *   Do NOT include \`new SlashCommandBuilder()\` or a semicolon at the end.

4.  **Generate \`executeBody\`:**
    *   Create the JavaScript code for the body of the \`execute(interaction)\` function.
    *   This code must retrieve option values using \`interaction.options.getString('name')\`, etc.
    *   Implement the logic described in the user's request. If you identified required packages, you must include the \`require()\` statement for them at the top of the body.
    *   The code should be ready to be placed inside an \`async function\`.

Now, process the request and provide the output in the specified JSON format.
`;

const createPrefixPrompt = (action: string, commandName: string) => `
You are an expert discord.js v14 programmer specializing in creating prefix-based commands.
Your task is to analyze a user's request and generate the necessary JSON output containing the code for the command's execute function.

The user's natural language request for what the command should do is: "${action}"
The command's name is: "${commandName}"

**Analysis and Generation Steps:**

1.  **Analyze Request for Arguments:** Carefully read the user's request ("${action}"). The command's arguments will be provided in a string array called \`args\`. Your code must correctly parse this array to get the arguments it needs. For user mentions, use \`message.mentions.users.first()\` or \`message.mentions.members.first()\`.

2.  **Analyze Request for Packages:** Analyze the request to see if it requires any external npm packages to function (e.g., \`axios\` for API calls). List these in the \`requiredPackages\` array. Do NOT include \`discord.js\` or \`dotenv\`.

3.  **Generate \`executeBody\`:**
    *   Create the JavaScript code for the body of the \`async execute(message, args)\` function.
    *   The code must implement the logic from the user's request.
    *   Use \`message.channel.send()\` or \`message.reply()\` to send responses.
    *   If any packages are needed, include the \`require()\` statement for them at the top of the body.
    *   Do NOT include the function definition itself, only the body.

Now, process the request and provide the output in the specified JSON format.
`;

const createPythonSlashPrompt = (action: string, commandName: string, commandDescription: string) => `
You are an expert discord.py v2 programmer. Your task is to generate Python code for a complete discord.py Cog file for a slash command based on a user's request.

The user's request is: "${action}"
The command's name is: "${commandName}"
The command's description is: "${commandDescription}"

**Instructions:**
1.  **Analyze Request:** Identify arguments, required permissions, and any external libraries (like 'aiohttp' for API calls).
2.  **Generate \`cogCode\`:**
    *   Create a complete, single Python code block for the entire file.
    *   The code MUST import \`discord\`, \`commands\` from \`discord.ext\`, and \`app_commands\` from \`discord\`.
    *   Define a class that inherits from \`commands.Cog\`.
    *   Inside the class, define an \`async\` method for the command, decorated with \`@app_commands.command()\`.
    *   The decorator must have \`name\` and \`description\` set correctly.
    *   Define parameters for the method that match the required command options. Use Python type hints (e.g., \`option_name: str\`, \`user: discord.Member\`). For options, use \`@app_commands.describe()\` decorator above the command to describe them.
    *   Implement the logic from the user's request inside the command's method.
    *   Use \`interaction.response.send_message()\` or \`interaction.response.defer()\` followed by \`interaction.followup.send()\`.
    *   At the end of the file, you MUST include the \`async def setup(bot: commands.Bot):\` function to add the cog to the bot.
3.  **Required Packages:** List any external pip packages needed (e.g., 'aiohttp') in the \`requiredPackages\` array. Do NOT include \`discord.py\` or \`python-dotenv\`.

Provide the output in the specified JSON format.
`;


const slashResponseSchema = {
    type: Type.OBJECT,
    properties: {
        commandData: {
            type: Type.STRING,
            description: "The JavaScript code for the SlashCommandBuilder method chain. Example: .setName('name').setDescription('desc').addStringOption(...)"
        },
        executeBody: {
            type: Type.STRING,
            description: "The JavaScript code for the body of the 'execute' function. It should use the options defined in commandData and include require() statements for any packages."
        },
        requiredPackages: {
            type: Type.ARRAY,
            description: "An array of strings listing required npm packages, e.g., ['axios', 'canvas'].",
            items: { type: Type.STRING }
        }
    },
    required: ["commandData", "executeBody", "requiredPackages"]
};

const prefixResponseSchema = {
    type: Type.OBJECT,
    properties: {
        executeBody: {
            type: Type.STRING,
            description: "The JavaScript code for the body of the 'execute(message, args)' function. It should include require() statements for any packages."
        },
        requiredPackages: {
            type: Type.ARRAY,
            description: "An array of strings listing required npm packages, e.g., ['axios', 'canvas'].",
            items: { type: Type.STRING }
        }
    },
    required: ["executeBody", "requiredPackages"]
};

const pythonResponseSchema = {
    type: Type.OBJECT,
    properties: {
        cogCode: {
            type: Type.STRING,
            description: "The complete Python code for the Cog file, including imports, the class definition, the command, and the setup function."
        },
        requiredPackages: {
            type: Type.ARRAY,
            description: "An array of strings listing required pip packages, e.g., ['aiohttp'].",
            items: { type: Type.STRING }
        }
    },
    required: ["cogCode", "requiredPackages"]
};

const eventResponseSchema = {
    type: Type.OBJECT,
    properties: {
        executeBody: {
            type: Type.STRING,
            description: "The JavaScript code for the body of the event's 'execute' function. It should include require() statements for any packages if needed."
        },
        requiredPackages: {
            type: Type.ARRAY,
            description: "An array of strings listing required npm packages, e.g., ['axios'].",
            items: { type: Type.STRING }
        }
    },
    required: ["executeBody", "requiredPackages"]
};

const pythonEventResponseSchema = {
    type: Type.OBJECT,
    properties: {
        cogCode: {
            type: Type.STRING,
            description: "The complete Python code for the Cog file containing the event listener, including imports, the class definition, the listener method, and the setup function."
        },
        requiredPackages: {
            type: Type.ARRAY,
            description: "An array of strings listing required pip packages, e.g., ['aiohttp'].",
            items: { type: Type.STRING }
        }
    },
    required: ["cogCode", "requiredPackages"]
};


const createNodejsEventPrompt = (eventName: string, action: string) => `
You are an expert discord.js v14 programmer. Your task is to generate the code for a specific event handler.
The event is: "${eventName}"
The user's request for what the event should do is: "${action}"

**Instructions:**
1.  **Analyze Parameters:** The event handler function will receive specific arguments. For example, 'ready' receives 'client', 'messageCreate' receives 'message', 'guildMemberAdd' receives 'member'. Your code must use these parameters correctly.
2.  **Generate \`executeBody\`:** Create the JavaScript code for the body of the \`async execute(...args)\` function.
    *   This code must implement the logic described in the user's request.
    *   If any packages are needed (e.g., \`axios\`), include the \`require()\` statement for them at the top of the body.
3.  **Required Packages:** List any external npm packages needed in the \`requiredPackages\` array.

Provide the output in the specified JSON format.
`;

const createPythonEventPrompt = (eventName: string, action: string) => `
You are an expert discord.py v2 programmer. Your task is to generate Python code for a complete discord.py Cog file for an event listener.
The event is: "${eventName}"
The user's request is: "${action}"

**Instructions:**
1.  **Analyze Request:** Identify any external libraries needed (like 'aiohttp' for API calls).
2.  **Generate \`cogCode\`:**
    *   Create a complete, single Python code block for the entire file.
    *   The code MUST import \`discord\` and \`commands\` from \`discord.ext\`.
    *   Define a class that inherits from \`commands.Cog\`. Give it a descriptive name like "OnReadyListener".
    *   Inside the class, define an \`async\` method for the listener, decorated with \`@commands.Cog.listener()\`.
    *   The method name MUST match the event name (e.g., \`async def on_ready(self):\`, \`async def on_message(self, message: discord.Message):\`).
    *   Implement the logic from the user's request inside the listener method.
    *   At the end of the file, you MUST include the \`async def setup(bot: commands.Bot):\` function to add the cog to the bot.
3.  **Required Packages:** List any external pip packages needed (e.g., 'aiohttp') in the \`requiredPackages\` array.

Provide the output in the specified JSON format.
`;


const parseJsonResponse = (text: string) => {
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('```')) {
         jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }
    return JSON.parse(jsonStr);
};


export const generateCommandCode = async (action: string, name: string, description: string, botType: 'slash' | 'prefix', language: 'nodejs' | 'python'): Promise<{ commandData: string, executeBody: string, requiredPackages: string[] }> => {
    
    let prompt: string;
    let schema: object;
    let isPython = language === 'python';

    if (isPython) {
        prompt = createPythonSlashPrompt(action, name, description);
        schema = pythonResponseSchema;
    } else { // nodejs
        prompt = botType === 'slash'
            ? createSlashPrompt(action, name, description)
            : createPrefixPrompt(action, name);
        schema = botType === 'slash' ? slashResponseSchema : prefixResponseSchema;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.2,
            }
        });
        
        const parsed = parseJsonResponse(response.text);
        
        if (isPython) {
            return {
                commandData: '', // Not used for Python
                executeBody: parsed.cogCode || `# Could not generate code.`,
                requiredPackages: parsed.requiredPackages || [],
            };
        }

        return {
            commandData: parsed.commandData || '',
            executeBody: parsed.executeBody || `// Could not generate execution code.`,
            requiredPackages: parsed.requiredPackages || [],
        };

    } catch (error) {
        console.error("Error calling Gemini API for command:", error);
        if (isPython) {
             return {
                 commandData: '',
                 executeBody: `# An error occurred while generating code.\n# ${JSON.stringify(error)}`,
                 requiredPackages: [],
             };
        }
        const commandData = botType === 'slash' ? `.setName('${name}').setDescription('${description}')` : '';
        const replyType = botType === 'slash' ? 'interaction.reply' : 'message.reply';
        return {
             commandData: commandData,
             executeBody: `// An error occurred while generating code.\nconsole.error("Gemini API Error:", ${JSON.stringify(error)}); \nawait ${replyType}('Sorry, I could not generate the code for this command.');`,
             requiredPackages: [],
        };
    }
};

export const generateEventCode = async (eventName: string, description: string, language: 'nodejs' | 'python'): Promise<{ executeBody: string, requiredPackages: string[] }> => {
    let prompt: string;
    let schema: object;
    const isPython = language === 'python';

    if (isPython) {
        prompt = createPythonEventPrompt(eventName, description);
        schema = pythonEventResponseSchema;
    } else {
        prompt = createNodejsEventPrompt(eventName, description);
        schema = eventResponseSchema;
    }

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3,
            }
        });
        
        const parsed = parseJsonResponse(response.text);

        if (isPython) {
            return {
                executeBody: parsed.cogCode || `# Could not generate code for event ${eventName}.`,
                requiredPackages: parsed.requiredPackages || [],
            };
        }
        
        return {
            executeBody: parsed.executeBody || `// Could not generate code for event ${eventName}.`,
            requiredPackages: parsed.requiredPackages || [],
        };

    } catch (error) {
        console.error(`Error calling Gemini API for event ${eventName}:`, error);
        if (isPython) {
            return {
                executeBody: `# An error occurred while generating code for event ${eventName}.\n# ${JSON.stringify(error)}`,
                requiredPackages: [],
            };
        }
        return {
            executeBody: `// An error occurred while generating code for event ${eventName}.\nconsole.error("Gemini API Error:", ${JSON.stringify(error)});`,
            requiredPackages: [],
        };
    }
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        botName: { type: Type.STRING, description: "The name of the bot project." },
        language: { type: Type.STRING, description: "The primary programming language, either 'nodejs' or 'python'." },
        framework: { type: Type.STRING, description: "For Node.js, the framework used: 'commonjs' or 'typescript'." },
        botType: { type: Type.STRING, description: "The command type: 'slash' or 'prefix'." },
        prefix: { type: Type.STRING, description: "The command prefix if botType is 'prefix'." },
        commands: {
            type: Type.ARRAY,
            description: "An array of command objects found in the code.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The command's name." },
                    description: { type: Type.STRING, description: "A detailed description of what the command does, inferred from code comments or the code itself." },
                    action: { type: Type.STRING, description: "A natural language summary of the command's functionality." }
                },
                required: ["name", "description", "action"]
            }
        },
        events: {
            type: Type.ARRAY,
            description: "An array of event handler objects found in the code.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The event's name (e.g., 'ready', 'messageCreate')." },
                    description: { type: Type.STRING, description: "A natural language summary of what the event handler does." }
                },
                required: ["name", "description"]
            }
        },
        welcomeSystemEnabled: { type: Type.BOOLEAN, description: "True if a welcome system (on_member_join or guildMemberAdd event handler) seems to be implemented." }
    },
    required: ["botName", "language", "commands", "events", "welcomeSystemEnabled"]
};

const createAnalysisPrompt = (files: { path: string, content: string }[]) => {
    const fileContents = files.map(file => `
// FILE: ${file.path}
\`\`\`
${file.content}
\`\`\`
    `).join('\n\n---\n');

    return `
You are an expert bot developer and code analyst. Your task is to analyze the provided collection of files from a Discord bot's GitHub repository and deconstruct it into a structured JSON format.

**Analysis Instructions:**
1.  **Determine Bot Vitals:**
    *   \`botName\`: Infer a suitable name from \`package.json\` or the root file.
    *   \`language\`: Identify if it's 'nodejs' or 'python'.
    *   \`framework\`: If Node.js, is it 'commonjs' (\`require\`) or 'typescript' (\`.ts\` files)?
    *   \`botType\`: Are the commands primarily 'slash' commands (using Interaction or app_commands) or 'prefix' commands?
    *   \`prefix\`: If it's a prefix bot, find the prefix.

2.  **Extract Commands:**
    *   Go through all command files.
    *   For each command, extract its \`name\`.
    *   Create a clear, user-friendly \`description\` based on the code's comments or logic.
    *   Create a natural language \`action\` summary of what the command does (e.g., "Kicks a member and logs it.").

3.  **Extract Events:**
    *   Go through all event handler files.
    *   For each event, extract its \`name\` (e.g., 'ready', 'messageCreate', 'guildMemberAdd').
    *   Create a natural language \`description\` of what happens when the event is triggered.

4.  **Detect Systems:**
    *   Check for a welcome system by looking for a 'guildMemberAdd' or 'on_member_join' event handler. Set \`welcomeSystemEnabled\` to true if found.

**Repository Files:**
${fileContents}

Now, provide the analysis in the specified JSON format.
`;
};


export const analyzeRepository = async (repoUrl: string, onProgress: (log: { messageKey: TranslationKeys, replacements?: Record<string, string> }) => void): Promise<Partial<GeneratedCodeProps>> => {
    onProgress({ messageKey: 'aiLogValidating' });
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (!urlMatch) {
        throw new Error("Invalid GitHub URL format.");
    }
    const repoPath = urlMatch[1].replace('.git', '');

    onProgress({ messageKey: 'aiLogFetchingTree' });
    let treeData;
    let successfulBranch;
    const branches = ['main', 'master'];
    for (const branch of branches) {
        try {
            const treeUrl = `https://api.github.com/repos/${repoPath}/git/trees/${branch}?recursive=1`;
            const response = await fetch(treeUrl);
            if (response.ok) {
                treeData = await response.json();
                successfulBranch = branch;
                break;
            }
        } catch (e) { /* continue to next branch */ }
    }
    if (!treeData || !treeData.tree || !successfulBranch) {
        throw new Error("Could not fetch repository file tree. Check if the repo is public and has a 'main' or 'master' branch.");
    }

    onProgress({ messageKey: 'aiLogIdentifyingFiles' });
    const filesToAnalyze = treeData.tree
        .filter((file: any) =>
            file.type === 'blob' && (
                file.path.endsWith('.js') ||
                file.path.endsWith('.ts') ||
                file.path.endsWith('.py') ||
                file.path.toLowerCase() === 'package.json' ||
                file.path.toLowerCase() === 'requirements.txt'
            ) && (
                file.path.includes('index.') ||
                file.path.includes('main.') ||
                file.path.includes('command') ||
                file.path.includes('event') ||
                file.path.includes('cog') ||
                file.path.toLowerCase().includes('package.json') ||
                file.path.toLowerCase().includes('requirements.txt')
            )
        )
        .slice(0, 20);

    onProgress({ messageKey: 'aiLogReadingFiles', replacements: { fileCount: String(filesToAnalyze.length) } });
    const fileContents = await Promise.all(
        filesToAnalyze.map(async (file: any) => {
            try {
                const contentUrl = `https://raw.githubusercontent.com/${repoPath}/${successfulBranch}/${file.path}`;
                const response = await fetch(contentUrl);
                if (!response.ok) return null;
                const content = await response.text();
                const truncatedContent = content.length > 5000 ? content.substring(0, 5000) + "\n... (file truncated)" : content;
                return { path: file.path, content: truncatedContent };
            } catch (e) {
                console.warn(`Could not fetch content for ${file.path}`);
                return null;
            }
        })
    );
    const validFileContents = fileContents.filter(f => f !== null) as { path: string, content: string }[];

    if (validFileContents.length === 0) {
        throw new Error("Could not read any key files from the repository.");
    }

    onProgress({ messageKey: 'aiLogCallingAI' });
    const prompt = createAnalysisPrompt(validFileContents);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            temperature: 0.1,
        }
    });

    onProgress({ messageKey: 'aiLogParsing' });
    const parsed = parseJsonResponse(response.text);

    const importedState: Partial<GeneratedCodeProps> = {
        botName: parsed.botName || "Imported Bot",
        language: parsed.language || 'nodejs',
        framework: parsed.framework || 'commonjs',
        botType: parsed.botType || 'slash',
        prefix: parsed.prefix || '!',
        commands: (parsed.commands || []).map((cmd: any) => ({
            id: `ai-${Date.now()}-${Math.random()}`,
            name: cmd.name,
            description: cmd.description,
            action: cmd.action,
            generatedData: '',
            generatedCode: `// Code for "${cmd.name}" was imported. Edit action and regenerate if needed.`,
            isGenerating: false,
            requiredPackages: []
        })),
        events: (parsed.events || []).map((evt: any) => ({
            id: `ai-evt-${Date.now()}-${Math.random()}`,
            name: evt.name,
            description: evt.description,
            generatedCode: `// Logic for "${evt.name}" was imported. Edit action and regenerate if needed.`,
            isGenerating: false,
            requiredPackages: []
        })),
        systems: {
            welcome: { enabled: !!parsed.welcomeSystemEnabled, channelId: '', message: 'Welcome {user}', useImage: false, backgroundImage: '' },
            moderation: { enabled: false, logChannelId: '' },
            tickets: { enabled: false, panelChannelId: '', logChannelId: '', openMessage: '', openMethod: 'button', departments: [] }
        }
    };

    onProgress({ messageKey: 'aiLogSuccess' });
    return importedState;
};

const embedFieldSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The title of the field." },
        value: { type: Type.STRING, description: "The body text of the field." },
        inline: { type: Type.BOOLEAN, description: "Whether the field should be displayed in-line with other fields." }
    },
    required: ['name', 'value']
};

const embedSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The main title of the embed.' },
        description: { type: Type.STRING, description: 'The main content/body of the embed. Supports Discord Markdown.' },
        color: { type: Type.INTEGER, description: 'The integer representation of the hex color code for the embed sidebar. E.g., for blue, use 3447003.' },
        author: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the author." },
                url: { type: Type.STRING, description: "URL to link on the author's name." },
                icon_url: { type: Type.STRING, description: "URL of a small image to display next to the author's name." }
            },
        },
        footer: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The text to display in the footer." },
                icon_url: { type: Type.STRING, description: "URL of a small image to display next to the footer text." }
            },
        },
        thumbnail: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: "URL of a small image to display in the top-right corner." }
            }
        },
        image: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: "URL of the main, large image to display at the bottom of the embed." }
            }
        },
        fields: {
            type: Type.ARRAY,
            description: "A list of fields to display in the embed.",
            items: embedFieldSchema
        }
    }
};

const createEmbedGenPrompt = (description: string) => `
You are a helpful assistant that generates Discord embed JSON objects based on a user's natural language description.
The user wants an embed that looks like this: "${description}"

**Instructions:**
1.  Carefully analyze the user's request to extract details for the embed (title, description, color, fields, author, footer, images).
2.  For the 'color' property, you MUST convert any color name (e.g., "blue", "red", "purple") into its decimal integer representation. For example, Discord Blurple (#5865F2) is 5793266. A nice purple is 0x4f46e5 which is 5208558. A common blue is 0x3498db which is 3447003.
3.  Generate a valid JSON object that strictly follows the provided schema for the Discord embed.
`;

export const generateEmbedJson = async (description: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: createEmbedGenPrompt(description),
            config: {
                responseMimeType: "application/json",
                responseSchema: embedSchema,
                temperature: 0.3,
            }
        });

        const parsed = parseJsonResponse(response.text);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        console.error("Error generating embed JSON:", error);
        return JSON.stringify({ error: "Failed to generate embed JSON.", details: `${error}` }, null, 2);
    }
};

/**
 * Simulates an AI safety check for a template configuration.
 * In a real application, this would send the config to a model with safety-focused instructions.
 */
export const analyzeTemplateSafety = async (templateConfig: string): Promise<{ safe: boolean, issues: string[] }> => {
    // Simulate API call delay
    await new Promise(res => setTimeout(res, 1500));
    
    // Mock analysis: check for common "bad" patterns
    const issues: string[] = [];
    if (templateConfig.toLowerCase().includes("everyone") || templateConfig.toLowerCase().includes("here")) {
        issues.push("Template might contain mass mentions (@everyone/@here).");
    }
    if (templateConfig.includes("delete") && templateConfig.includes("channel")) {
        issues.push("Template might contain channel deletion logic.");
    }

    if (issues.length > 0) {
        return { safe: false, issues };
    }

    return { safe: true, issues: [] };
};

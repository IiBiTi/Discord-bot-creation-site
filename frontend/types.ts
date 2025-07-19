

export interface Command {
    id: string;
    name:string;
    description: string;
    action: string;
    generatedData?: string; // For SlashCommandBuilder data or other metadata
    generatedCode: string; // For execute function body or full Cog class
    isGenerating: boolean;
    requiredPackages?: string[];
}

export interface Event {
    id: string;
    name: string;
    description: string;
    generatedCode: string;
    isGenerating: boolean;
    requiredPackages?: string[];
}

export interface WelcomeSystem {
    enabled: boolean;
    channelId: string;
    message: string;
    useImage: boolean;
    backgroundImage: string;
}

export interface ModerationSystem {
    enabled: boolean;
    logChannelId: string;
}

export interface TicketDepartment {
    id:string;
    label: string;
    description: string;
    categoryId: string;
    supportRoleId: string;
    welcomeMessage: string;
    imageUrl: string;
}

export interface TicketSystem {
    enabled: boolean;
    panelChannelId: string;
    logChannelId: string;
    openMessage: string;
    openMethod: 'button' | 'menu';
    departments: TicketDepartment[];
}

export interface Systems {
    welcome: WelcomeSystem;
    moderation: ModerationSystem;
    tickets: TicketSystem;
}

export interface GeneratedCodeProps {
    botName: string;
    botToken: string;
    clientId: string;
    commands: Command[];
    events: Event[];
    systems: Systems;
    botType: 'slash' | 'prefix';
    prefix: string;
    framework: 'commonjs' | 'typescript';
    language: 'nodejs' | 'python';
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface User {
    id: string;
    email: string | null;
    name: string | null;
    role: 'user' | 'admin';
    provider?: 'discord' | 'google' | 'github';
}

export interface Template {
    id: string;
    name: string;
    description: string;
    author: string;
    authorId: string;
    status: 'pending' | 'approved' | 'rejected';
    config: Partial<GeneratedCodeProps>;
    imageUrl?: string;
    language: 'nodejs' | 'python';
    botType: 'slash' | 'prefix';
}

export interface UserActivity {
    id: string;
    userId: string;
    type: 'tool_used' | 'bot_created' | 'project_downloaded';
    timestamp: string;
    details: Record<string, any>;
}
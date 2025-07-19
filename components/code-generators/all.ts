
import { GeneratedCodeProps } from '../../types';
import { generateCommonJSPrefixProject, generateCommonJSSlashProject } from './nodejs_commonjs';
import { generateTypeScriptPrefixProject, generateTypeScriptSlashProject } from './nodejs_typescript';
import { generatePythonProject } from './python';


// =======================================================================================
// DISPATCHER AND MAIN EXPORTS
// =======================================================================================

export const generateFileContent = (props: GeneratedCodeProps) => {
    if (props.language === 'python') {
        return generatePythonProject(props);
    }

    if (props.framework === 'typescript') {
        return props.botType === 'slash'
            ? generateTypeScriptSlashProject(props)
            : generateTypeScriptPrefixProject(props);
    }
    
    // Default to CommonJS
    return props.botType === 'prefix'
        ? generateCommonJSPrefixProject(props)
        : generateCommonJSSlashProject(props);
};


export const downloadProjectAsZip = async (props: GeneratedCodeProps) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = (await import('file-saver'));

    const zip = new JSZip();
    const { generatedFiles, ...otherFiles } = generateFileContent(props);

    // Create a safe version of the state for export, removing sensitive data and volatile state.
    const { commands, events, systems, botName, botType, prefix, framework, language } = props;
    const exportState = {
        botName,
        botType,
        prefix,
        language,
        framework,
        commands: commands.map(({ id, isGenerating, generatedData, generatedCode, ...cmd }) => cmd),
        events: events.map(({ id, isGenerating, generatedCode, ...evt }) => evt),
        systems,
        generatorVersion: '1.1.0' // Incremented version
    };
    zip.file('discord-bot-generator.json', JSON.stringify(exportState, null, 2));

    for (const [fileName, content] of Object.entries(otherFiles)) {
        zip.file(fileName, content as string);
    }
    
    // Ensure the base folders exist
    if (props.language === 'python') {
        zip.folder('cogs');
    } else {
        const src = props.framework === 'typescript' ? 'src/' : '';
        zip.folder(`${src}commands`);
        zip.folder(`${src}events`);
    }

    generatedFiles.forEach((file: { name: string, content: string }) => {
        // file.name already contains the full path (e.g., "commands/ping.js")
        zip.file(file.name, file.content);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${props.botName.replace(/\s/g, '-')}.zip`);
};

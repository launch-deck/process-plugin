import { shell } from 'electron';
import * as process from 'process';
import { Window } from './window.interface';
import type { Command, CommandInputSelectionOption, Plugin } from "@launch-deck/common";

const processAddon = require('../build/Release/process')

enum CommandType {
    START,
    FOCUS_OR_START,
    KILL,
}

const ProcessPlugin: Plugin = {

    async handleCommand(command: Command): Promise<void> {

        const type = command.type as CommandType;

        switch (type) {
            case CommandType.START:
                startProcess(command);
                break;
            case CommandType.FOCUS_OR_START:
                await focusOrStartProcess(command);
                break;
            case CommandType.KILL:
                await killProcess(command);
                break;
        }
    },

    async getCommands(): Promise<Command[]> {

        const processPaths: CommandInputSelectionOption[] = await getProcessPathOptions();

        const commands: Command[] = [
            {
                name: 'Start',
                type: CommandType.START,
                commandInputs: {
                    path: {
                        name: "Path",
                        type: 'suggest',
                        selectionOptions: processPaths
                    }
                }
            },
            {
                name: 'Focus or Start',
                type: CommandType.FOCUS_OR_START,
                commandInputs: {
                    path: {
                        name: "Path",
                        type: 'suggest',
                        selectionOptions: processPaths
                    },
                    windowName: {
                        name: 'Window Name',
                        type: 'value'
                    }
                }
            },
            {
                name: 'Kill',
                type: CommandType.KILL,
                commandInputs: {
                    process: {
                        name: "Process Name",
                        type: 'suggest',
                        selectionOptions: processPaths
                    },
                    windowName: {
                        name: 'Window Name',
                        type: 'value'
                    }
                }
            }
        ];

        return commands;
    }
}

async function startProcess(command: Command): Promise<void> {

    const path = command.data?.path;

    if (path != null) {
        isValidHttpUrl(path) ? shell.openExternal(path) : shell.openPath(path);
    }
}

async function focusOrStartProcess(command: Command): Promise<void> {

    const path = command.data?.path;
    const windowName = command.data?.windowName;

    const window = await findWindow(undefined, path, windowName);
    if (window) {
        processAddon.focusWindow(window.pid);
    } else if (path != null) {
        isValidHttpUrl(path) ? shell.openExternal(path) : shell.openPath(path);
    }
}

async function killProcess(command: Command): Promise<void> {

    const processName = command.data?.process;
    const windowName = command.data?.windowName;

    if (processName != null) {
        const window = await findWindow(processName, undefined, windowName);
        if (window) {
            process.kill(window.pid);
        }
    }
}

async function getProcessPathOptions(): Promise<CommandInputSelectionOption[]> {
    const windows: Window[] = processAddon.getWindows();

    const exclusions = [
        'ApplicationFrameHost.exe',
        'ShellExperienceHost.exe',
        'SystemSettings.exe',
        'LogiOverlay.exe',
        'TextInputHost.exe',
        'Rainmeter.exe',
        'TabTip.exe',
        'StartMenuExperienceHost.exe',
        'SearchHost.exe',
        'RtkUWP.exe'
    ];

    return windows
        .filter(window => {
            return !exclusions.find(exclusion => window.process.endsWith(exclusion));
        })
        .map(window => {
            let name = window.process.replace(/\\/g, "/").split("/").pop();
            return { name: name || window.process, data: window.process };
        });
}

async function findWindow(processName?: string, path?: string, windowName?: string): Promise<Window | undefined> {
    const windows: Window[] = processAddon.getWindows();

    if (!processName && !path && !windowName) {
        return undefined;
    }

    return windows.find(window => {

        if (processName && !window.process.startsWith(processName)) {
            return false;
        }

        if (path && !path.endsWith(window.process) && !window.process.endsWith(path)) {
            return false;
        }

        if (windowName && (!window.windowName || !window.windowName.toLowerCase().includes(windowName.toLowerCase()))) {
            return false;
        }

        return true;
    });
}

function isValidHttpUrl(value: string) {
    let url;
    try {
        url = new URL(value);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

export default ProcessPlugin;

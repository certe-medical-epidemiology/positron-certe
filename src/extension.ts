import * as vscode from 'vscode';
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function activate(context: vscode.ExtensionContext) {
    const openFolderCmd = vscode.commands.registerCommand(
        "certe.openFolder",
        () => {
            const positron = tryAcquirePositronApi();
            positron?.runtime.executeCode(
                "r",
                'certeprojects::project_open_folder()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(openFolderCmd);

    const moveTaskCmd = vscode.commands.registerCommand(
        "certe.moveTask",
        () => {
            const positron = tryAcquirePositronApi();
            positron?.runtime.executeCode(
                "r",
                'certeprojects::project_update()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(moveTaskCmd);


    const newConsult = vscode.commands.registerCommand(
        "certe.newConsult",
        () => {
            const positron = tryAcquirePositronApi();
            positron?.runtime.executeCode(
                "r",
                'certeprojects::consult_add()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(newConsult);

    const newProject = vscode.commands.registerCommand(
        "certe.newProject",
        () => {
            const positron = tryAcquirePositronApi();
            positron?.runtime.executeCode(
                "r",
                'certeprojects::project_add()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(newProject);

  }

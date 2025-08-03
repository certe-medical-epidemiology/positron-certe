import * as vscode from 'vscode';
import { tryAcquirePositronApi } from "@posit-dev/positron";
import { register } from 'module';

export function activate(context: vscode.ExtensionContext) {
    const positron = tryAcquirePositronApi();

    // open up our MySQL connection in the Connections pane
    positron?.runtime.executeCode(
        "r",
        'certedb::mysql_in_connections_pane()',
        false // do not focus to Console
    );

    const openFolderCmd = vscode.commands.registerCommand(
        "certe.openFolder",
        () => {
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
            positron?.runtime.executeCode(
                "r",
                'certeprojects::project_add()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(newProject);

  }

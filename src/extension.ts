import * as vscode from 'vscode';
import { tryAcquirePositronApi } from "@posit-dev/positron";
import * as path from "path";
import * as os from "os";

export function activate(context: vscode.ExtensionContext) {

    // set Certe colour theme as default
    const config = vscode.workspace.getConfiguration();
    const themeSetting = config.inspect<string>('workbench.colorTheme')
    if (themeSetting && themeSetting.globalValue === undefined) {
        config.update('workbench.colorTheme', 'Certe Light (certeblauw)', vscode.ConfigurationTarget.Global);
    }

    // set material icon theme if not set yet
    const iconThemeSetting = config.inspect<string>('workbench.iconTheme');
    if (iconThemeSetting && iconThemeSetting.globalValue === undefined) {
        config.update('workbench.iconTheme', 'material-icon-theme', vscode.ConfigurationTarget.Global);
    }
    
    // set up addins
    const positron = tryAcquirePositronApi();

    // open up our MySQL connection in the Connections pane
    positron?.runtime.executeCode(
        "r",
        'require("certeprojects", quietly = TRUE)',
        false // do not focus to Console
    );
    positron?.runtime.executeCode(
        "r",
        'certedb::mysql_init()',
        false // do not focus to Console
    );

    const moveTaskCmd = vscode.commands.registerCommand(
        "certe.moveTask",
        () => {
            positron?.runtime.executeCode(
                "r",
                'certeprojects:::positron_moveTask()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(moveTaskCmd);

    const openFolderCmd = vscode.commands.registerCommand(
        "certe.openFolder",
        () => {
            positron?.runtime.executeCode(
                "r",
                'certeprojects:::positron_openFolder()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(openFolderCmd);

    const copyFolderLinkCmd = vscode.commands.registerCommand(
        "certe.copyFolderLink",
        () => {
            positron?.runtime.executeCode(
                "r",
                'certeprojects:::positron_copyFolderLink()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(copyFolderLinkCmd);

    const openSharePointCmd = vscode.commands.registerCommand(
        "certe.openSharePoint",
        () => {
            positron?.runtime.executeCode(
                "r",
                'certeprojects:::positron_openSharePoint()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(openSharePointCmd);

    const validateRequestCmd = vscode.commands.registerCommand("certe.validateRequest", async (uri?: vscode.Uri) => {
        const fileName = uri?.fsPath ? path.basename(uri.fsPath) : "??";
        const result = await vscode.window.showInformationMessage(
            `Validatieverzoek voor bestand '${fileName}' maken?`,
            { modal: true },
            "OK"
        );
        if (result === "OK") {
            positron?.runtime.executeCode("r", "certeprojects:::positron_validate_request()", false);
        }
    });
    context.subscriptions.push(validateRequestCmd);

    const validateCmd = vscode.commands.registerCommand("certe.validate", async (uri?: vscode.Uri) => {
        const fileName = uri?.fsPath ? path.basename(uri.fsPath) : "??";
        const userName = os.userInfo().username;
        const result = await vscode.window.showInformationMessage(
            `Hiermee wordt het bestand '${fileName}' gevalideerd als gebruiker '${userName}'.\n\nDit wordt gelogd in SharePoint.`,
            { modal: true },
            "Alleen valideren",
            "Valideren met autorisatieverzoek"
        );
        if (result === "Alleen valideren") {
            positron?.runtime.executeCode("r", "certeprojects:::positron_validate(authorise_request = FALSE)", false);
        } else if (result === "Valideren met autorisatieverzoek") {
            positron?.runtime.executeCode("r", "certeprojects:::positron_validate(authorise_request = TRUE)", false);
        }
    });
    context.subscriptions.push(validateCmd);

    const authoriseCmd = vscode.commands.registerCommand("certe.authorise", async (uri?: vscode.Uri) => {
        const fileName = uri?.fsPath ? path.basename(uri.fsPath) : "??";
        const userName = os.userInfo().username;
        const result = await vscode.window.showWarningMessage(
            `Hiermee wordt het bestand '${fileName}' nu geautoriseerd als gebruiker '${userName}'.\n\nDit wordt gelogd in SharePoint en de Planner-taak wordt bijgewerkt.`,
            { modal: true },
            "OK"
        );
        if (result === "OK") {
            positron?.runtime.executeCode("r", "certeprojects:::positron_authorise()", false);
        }
    });
    context.subscriptions.push(authoriseCmd);


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

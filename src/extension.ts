import * as vscode from 'vscode';
import { tryAcquirePositronApi } from "@posit-dev/positron";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";

export function copyFileToClipboard(filePath: string) {
    const platform = os.platform();

    if (platform === "win32") {
        // Windows: use PowerShell to copy file to clipboard
        const command = `powershell -command "Set-Clipboard -Path '${filePath}'"`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error copying file: ${stderr}`);
            }
        });

    } else if (platform === "darwin") {
        // macOS: use AppleScript to set clipboard to file alias
        const appleScript = `set the clipboard to POSIX file "${filePath}"`;
        exec(`osascript -e '${appleScript}'`, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error copying file: ${stderr}`);
            }
        });

    } else if (platform === "linux") {
        // Linux: use xclip with file URI and appropriate MIME type
        const command = `printf "copy\nfile://${filePath}" | xclip -selection clipboard -t x-special/gnome-copied-files`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage("Failed to copy file using xclip. Is xclip installed?");
            }
        });

    } else {
        vscode.window.showWarningMessage("Platform not supported for file copy to clipboard.");
    }
  }

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

    // // open up our MySQL connection in the Connections pane
    // positron?.runtime.executeCode(
    //     "r",
    //     'require("certeprojects", quietly = TRUE)',
    //     false // do not focus to Console
    // );
    // positron?.runtime.executeCode(
    //     "r",
    //     'certedb::mysql_init()',
    //     false // do not focus to Console
    // );

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

    const copyLinkCmd = vscode.commands.registerCommand("certe.copyLink", async (uri?: vscode.Uri) => {
        const fileName = uri?.fsPath ? path.basename(uri.fsPath) : "??";
        const fileNameFull = uri?.fsPath ?? "??";
        const result = await vscode.window.showInformationMessage(
            `Naar het klembord kopiëren:`,
            { modal: true },
            "Link naar huidige map (alleen-lezen)",
            `Link naar '${fileName}' (alleen-lezen)`,
            `Link naar '${fileName}' (schrijven)`,
            `Bestand '${fileName}' zelf`
        );
        if (result === "Link naar huidige map (alleen-lezen)") {
            positron?.runtime.executeCode("r", 'certeprojects:::positron_copyLink("folder", type = "view")', false);
        } else if (result === `Link naar '${fileName}' (alleen-lezen)`) {
            positron?.runtime.executeCode("r", 'certeprojects:::positron_copyLink("file", type = "view")', false);
        } else if (result === `Link naar '${fileName}' (schrijven)`) {
            positron?.runtime.executeCode("r", 'certeprojects:::positron_copyLink("file", type = "edit")', false);
        } else if (result === `Bestand '${fileName}' zelf`) {
            copyFileToClipboard(fileNameFull);
            vscode.window.showInformationMessage(
                'Bestand naar klembord gekopieerd.',
                { modal: false }
              );
        }
    });
    context.subscriptions.push(copyLinkCmd);

    const versionsCmd = vscode.commands.registerCommand(
        "certe.versions",
        () => {
            positron?.runtime.executeCode(
                "r",
                'certeprojects:::positron_versions()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(versionsCmd);

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
            `Hiermee wordt het bestand '${fileName}' nu geautoriseerd als gebruiker '${userName}'.\n\nDit wordt gelogd in SharePoint.`,
            { modal: true },
            "OK"
        );
        if (result === "OK") {
            positron?.runtime.executeCode("r", "certeprojects:::positron_authorise()", false);
        }
    });
    context.subscriptions.push(authoriseCmd);

    const newProjectConsult = vscode.commands.registerCommand(
        "certe.newProjectConsult",
        () => {
            positron?.runtime.executeCode(
                "r",
                'certeprojects:::positron_project_consult_add()',
                false // do not focus to Console
            );
        }
    );
    context.subscriptions.push(newProjectConsult);

  }

import { Command } from "commander";
import { promptMultiLine } from "./utils/input.js";
import { addVault, viewVault, listVault, deleteVault } from "./vault/vault.js";
import { info, success, error } from "./utils/logger.js";
import readline from "readline";

// Track failed attempts per title
const failedAttempts: Record<string, { count: number; lockUntil: number }> = {};

// Ask password with masking
export const askPassword = (promptText: string): Promise<string> => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        
        // Override _writeToOutput to mask input
        (rl as any)._writeToOutput = function (stringToWrite: string) {
            if (!this.stdoutMuted) {
                this.output.write(stringToWrite);
            } else {
                this.output.write("*".repeat(stringToWrite.length));
            }
        };

        (rl as any).stdoutMuted = false;

        (rl as any).stdoutMuted = true; // mask input
        rl.question(promptText, (password: string) => {
            (rl as any).stdoutMuted = false;
            rl.close();
            console.log(""); // new line
            resolve(password);
        });
    });
};

const verifyPasswordWithRetries = async (title: string): Promise<string | null> => {
    const maxAttempts = 3;
    const lockTimeMs = 30_000;

    // Check if title is locked
    const lockInfo = failedAttempts[title];
    if (lockInfo && lockInfo.lockUntil > Date.now()) {
        info(`"${title}" is temporarily locked. Try again in ${Math.ceil((lockInfo.lockUntil - Date.now()) / 1000)}s.`);
        return null;
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const password = await askPassword("Master password: ");
        try {
            const codes = await viewVault(title, password);
            if (codes) {
                // Reset failed attempts on success
                failedAttempts[title] = { count: 0, lockUntil: 0 };
                return password;
            }
        } catch {
            // ignore error, treat as wrong password
        }
        error(`Wrong password (${attempt}/${maxAttempts})`);
    }

    // Lock the title for 30s
    failedAttempts[title] = { count: maxAttempts, lockUntil: Date.now() + lockTimeMs };
    info(`Too many failed attempts. "${title}" is locked for 30 seconds.`);
    return null;
};

export const runCLI = async (): Promise<void> => {
    const program = new Command();

    program
        .name("vault")
        .description("CLI tool to manage recovery codes")
        .version("1.0.0");

    program
        .command("add")
        .argument("<title>", "Title for your codes")
        .action(async (title: string) => {
            try {
                const password: string = await askPassword("Master password: ");
                const codes: string[] = await promptMultiLine(`Enter codes for "${title}"`);
                await addVault(title, codes, password);
                success(`Saved ${codes.length} codes under "${title}"`);
            } catch (e: unknown) {
                if (e instanceof Error) error(e.message);
                else error(String(e));
            }
        });

    program
        .command("view")
        .argument("<title>", "Title to view codes")
        .action(async (title: string) => {
            try {
                const password: string | null = await verifyPasswordWithRetries(title);
                if (!password) return;
                const codes: string[] | undefined = await viewVault(title, password);
                if (!codes || codes.length === 0) {
                    info("No codes found");
                    return;
                }
                success(`Codes for "${title}":`);
                codes.forEach((c: string, i: number) => console.log(`${i + 1}. ${c}`));
            } catch (e: unknown) {
                if (e instanceof Error) error(e.message);
                else error(String(e));
            }
        });

    program
        .command("list")
        .description("List all saved titles")
        .action(async () => {
            try {
                const titles: string[] = await listVault();
                if (titles.length === 0) {
                    info("No titles found");
                    return;
                }
                success("Saved titles:");
                titles.forEach((t: string, i: number) => console.log(`${i + 1}. ${t}`));
            } catch (e: unknown) {
                if (e instanceof Error) error(e.message);
                else error(String(e));
            }
        });

    program
        .command("delete")
        .argument("<title>", "Title to delete")
        .action(async (title: string) => {
            try {
                const password: string | null = await verifyPasswordWithRetries(title);
                if (!password) return;
                const ok: boolean = await deleteVault(title);
                if (ok) success(`Deleted "${title}"`);
                else info(`Title "${title}" not found`);
            } catch (e: unknown) {
                if (e instanceof Error) error(e.message);
                else error(String(e));
            }
        });

    await program.parseAsync(process.argv);
};
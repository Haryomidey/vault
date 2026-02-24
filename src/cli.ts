import { Command } from "commander";
import { promptMultiLine } from "./utils/input.js";
import { addVault, viewVault, listVault, deleteVault } from "./vault/vault.js";
import { info, success, error } from "./utils/logger.js";
import { getLocks, saveLocks } from "./vault/lockStore.js";

export const askPassword = (promptText: string): Promise<string> => {
    return new Promise((resolve) => {
        process.stdout.write(promptText);

        const stdin = process.stdin;

        if (stdin.isTTY) {
            stdin.setRawMode(true);
        }

        stdin.resume();
        stdin.setEncoding("utf8");

        let password = "";

        const onData = (char: string) => {
            char = String(char);

            // ENTER
            if (char === "\r" || char === "\n") {
                if (stdin.isTTY) {
                    stdin.setRawMode(false);
                }
                stdin.pause();
                stdin.removeListener("data", onData);
                process.stdout.write("\n");
                resolve(password);
            }

            // CTRL + C
            else if (char === "\u0003") {
                process.exit();
            }

            // BACKSPACE (Windows + Unix support)
            else if (char === "\u0008" || char === "\u007F") {
                if (password.length > 0) {
                    password = password.slice(0, -1);

                    // Move cursor back, erase char, move back again
                    process.stdout.write("\b \b");
                }
            }

            // Ignore special keys (arrows, etc.)
            else if (char.charCodeAt(0) < 32) {
                return;
            }

            // Normal character
            else {
                password += char;
                process.stdout.write("*");
            }
        };

        stdin.on("data", onData);
    });
};

const verifyPasswordWithRetries = async (title: string): Promise<string | null> => {
    const maxAttempts = 3;
    const lockTimeMs = 30_000;

    const locks = await getLocks();
    const lockInfo = locks[title];

    // Check if locked
    if (lockInfo && lockInfo.lockUntil > Date.now()) {
        const remaining = Math.ceil((lockInfo.lockUntil - Date.now()) / 1000);
        info(`"${title}" is locked. Try again in ${remaining}s.`);
        return null;
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const password = await askPassword("Master password: ");

        try {
            const codes = await viewVault(title, password);
            if (codes) {
                // Reset lock on success
                delete locks[title];
                await saveLocks(locks);
                return password;
            }
        } catch {
            // Treat as wrong password
        }

        error(`Wrong password (${attempt}/${maxAttempts})`);
    }

    // Lock the title
    locks[title] = {
        lockUntil: Date.now() + lockTimeMs
    };

    await saveLocks(locks);

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
                const password = await askPassword("Master password: ");
                const codes = await promptMultiLine(`Enter codes for "${title}"`);
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
                const password = await verifyPasswordWithRetries(title);
                if (!password) return;

                const codes = await viewVault(title, password);

                if (!codes || codes.length === 0) {
                    info("No codes found");
                    return;
                }

                success(`Codes for "${title}":`);
                codes.forEach((c: string, i: number) =>
                    console.log(`${i + 1}. ${c}`)
                );
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
                const titles = await listVault();

                if (titles.length === 0) {
                    info("No titles found");
                    return;
                }

                success("Saved titles:");
                titles.forEach((t: string, i: number) =>
                    console.log(`${i + 1}. ${t}`)
                );
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
                const password = await verifyPasswordWithRetries(title);
                if (!password) return;

                const ok = await deleteVault(title);

                if (ok) success(`Deleted "${title}"`);
                else info(`Title "${title}" not found`);
            } catch (e: unknown) {
                if (e instanceof Error) error(e.message);
                else error(String(e));
            }
        });

    await program.parseAsync(process.argv);
};
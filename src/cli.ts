import { Command } from "commander";
import { promptMultiLine } from "./utils/input.js";
import { addVault, viewVault, listVault, deleteVault } from "./vault/vault.js";
import { info, success, error } from "./utils/logger.js";
import readline from "readline";

export const runCLI = async (): Promise<void> => {
    const program = new Command();

    program
        .name("vault")
        .description("CLI tool to manage recovery codes")
        .version("1.0.0");

    program
        .command("add")
        .argument("<title>", "Title for your codes")
        .action((title: string) => {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            rl.question("Master password: ", async (password: string) => {
                rl.close();
                try {
                    const codes: string[] = await promptMultiLine(`Enter codes for "${title}"`);
                    await addVault(title, codes, password);
                    success(`Saved ${codes.length} codes under "${title}"`);
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        error(e.message);
                    } else {
                        error(String(e));
                    }
                }
            });
        });

    program
        .command("view")
        .argument("<title>", "Title to view codes")
        .action((title: string) => {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            rl.question("Master password: ", async (password: string) => {
                rl.close();
                try {
                    const codes: string[] | undefined = await viewVault(title, password);
                    if (!codes || codes.length === 0) {
                        info("No codes found");
                        return;
                    }
                    success(`Codes for "${title}":`);
                    codes.forEach((c: string, i: number) => console.log(`${i + 1}. ${c}`));
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        error(e.message);
                    } else {
                        error(String(e));
                    }
                }
            });
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
                if (e instanceof Error) {
                    error(e.message);
                } else {
                    error(String(e));
                }
            }
        });

    program
        .command("delete")
        .argument("<title>", "Title to delete")
        .action(async (title: string) => {
            try {
                const ok: boolean = await deleteVault(title);
                if (ok) {
                    success(`Deleted "${title}"`);
                } else {
                    info(`Title "${title}" not found`);
                }
            } catch (e: unknown) {
                if (e instanceof Error) {
                    error(e.message);
                } else {
                    error(String(e));
                }
            }
        });

    await program.parseAsync(process.argv);
};

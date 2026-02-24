import readline from "readline";

export function promptMultiLine(question: string): Promise<string[]> {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const lines: string[] = [];
        console.log(question + " (Enter empty line to finish)");
        rl.on("line", input => {
        if (!input) {
            rl.close();
        } else {
            lines.push(input);
        }
        });
        rl.on("close", () => resolve(lines));
    });
};
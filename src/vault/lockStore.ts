import fs from "fs/promises";
import path from "path";

const LOCK_FILE = path.resolve(".vault-locks.json");

export const getLocks = async (): Promise<Record<string, any>> => {
    try {
        const data = await fs.readFile(LOCK_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return {};
    }
};

export const saveLocks = async (locks: Record<string, any>): Promise<void> => {
    await fs.writeFile(LOCK_FILE, JSON.stringify(locks, null, 4));
};
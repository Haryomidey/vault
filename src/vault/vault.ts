import crypto from "crypto";
import { codesCol } from "./db.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

export const encrypt = (text: string, password: string) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(password, "vault_salt", 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        data: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
    };
};

export const decrypt = (enc: { data: string; iv: string; tag: string }, password: string) => {
    const key = crypto.scryptSync(password, "vault_salt", 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(enc.iv, "hex"));
    decipher.setAuthTag(Buffer.from(enc.tag, "hex"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(enc.data, "hex")),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
};

export async function addVault(title: string, codes: string[], password: string) {
    const encCodes = codes.map((c) => encrypt(c, password));
    const existing = await codesCol.getOne({ title });
    if (existing) {
        await codesCol.updateById(existing.id, { codes: encCodes });
    } else {
        await codesCol.add({ title, codes: encCodes });
    }
}

export async function viewVault(title: string, password: string) {
    const record = await codesCol.getOne({ title });
    if (!record) return [];
    try {
        return record.codes.map((c: any) => decrypt(c, password));
    } catch {
        throw new Error("Incorrect master password or corrupted data.");
    }
}

export async function listVault() {
    const all = await codesCol.getAll();
    return all.map((r: any) => r.title);
}

export async function deleteVault(title: string) {
    const record = await codesCol.getOne({ title });
    if (!record) return false;
    await codesCol.deleteById(record.id);
    return true;
}
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

export function encrypt(text: string, password: string) {
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(password, "salt", 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(enc: string, password: string) {
    const b = Buffer.from(enc, "base64");
    const iv = b.slice(0, 12);
    const tag = b.slice(12, 28);
    const encrypted = b.slice(28);
    const key = crypto.scryptSync(password, "salt", 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
}


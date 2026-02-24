import { codesCol } from "./db";
import { encrypt, decrypt } from "./encryption";

export async function addVault(title: string, codes: string[], password: string) {
    const encCodes = codes.map(c => encrypt(c, password));
    await codesCol.add({ title, codes: encCodes });
}

export async function viewVault(title: string, password: string) {
    const record = await codesCol.getOne({ title });
    if (!record) return [];
    return record.codes.map(c => decrypt(c, password));
}

export async function listVault() {
    const all = await codesCol.getAll();
    return all.map(r => r.title);
}

export async function deleteVault(title: string) {
    const record = await codesCol.getOne({ title });
    if (!record) return false;
    await codesCol.deleteById(record.id);
    return true;
}
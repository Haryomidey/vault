import ChronoDB from "chronodb";
import path from "path";
import os from "os";
import fs from "fs";

const DATA_DIR = path.join(os.homedir(), ".vault");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = await ChronoDB.open({
    cloudSync: false,
    path: DATA_DIR,
});

export const codesCol = db.col("codes", {
    schema: {
        title: { type: "string", distinct: true },
        codes: { type: "array", items: "string" },
    },
});
import ChronoDB from "chronodb";

export const db = await ChronoDB.open({
    cloudSync: false,
    path: "./data",
});

export const codesCol = db.col("codes", {
    schema: {
        title: { type: "string", distinct: true },
        codes: { type: "array", items: "string" },
    },
});


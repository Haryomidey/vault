# Vault CLI

A local CLI tool to securely store and manage recovery codes, 2FA codes, or other secret codes. Each set of codes is saved under a **title**, encrypted with a master password. Built with **Node.js**, **TypeScript**, and **ChronoDB**.

---

## Features

- Add codes under a specific title
- View codes for a title (requires master password)
- List all saved titles
- Delete a title
- Local-first storage using ChronoDB (JSON-based)
- Password-protected & encrypted data

---

## Installation

Clone the repo:

```bash
git clone <your-repo-url>
cd vault

Install dependencies:

pnpm install
# or
npm install

Build TypeScript:

pnpm run build
# or
npm run build
Usage

Run the CLI:

pnpm run start -- <command>
# or
node dist/index.js <command>
Commands

Add codes

vault add "Paystack Recovery Codes"

You’ll be prompted for your master password and then to enter codes line by line. End with an empty line.

View codes

vault view "Paystack Recovery Codes"

You’ll be prompted for your master password to decrypt and display the codes.

List titles

vault list

Shows all saved titles.

Delete a title

vault delete "Paystack Recovery Codes"

Deletes the title and all associated codes.

Folder Structure
vault/
├─ src/
│  ├─ cli.ts             # CLI entry point
│  ├─ index.ts           # Main entry for Node
│  ├─ vault/
│  │  └─ vault.ts        # Vault functions (add, view, list, delete)
│  └─ utils/
│     ├─ input.ts        # Multi-line input helper
│     └─ logger.ts       # Colored logging (info, success, error)
├─ dist/                 # Compiled TypeScript output
├─ package.json
├─ tsconfig.json
└─ README.md

⚠️ Do not commit data/ folder to GitHub. It contains encrypted codes.

Development

Watch for changes and compile automatically:

pnpm tsc --watch

Run CLI locally without building:

pnpm exec ts-node src/index.ts <command>
Dependencies

Node.js 18+

TypeScript

ChronoDB – JSON-based local database

Commander – CLI parser

Dev dependencies

@types/node – Node type definitions

ts-node – TypeScript runner

Security

Codes are encrypted locally using a master password.

Data never leaves your machine.

Keep your master password safe!

License

MIT License
# 🔐 Vault CLI

A secure, local-first CLI tool to store and manage recovery codes, 2FA
backup codes, and other sensitive secrets.

Each set of codes is saved under a **title** and encrypted with a
**master password**.

Built with **Node.js**, **TypeScript**, and **ChronoDB**.

------------------------------------------------------------------------

## ✨ Features

-   🔒 Store recovery/2FA codes under a custom title\
-   🔑 Master password protection\
-   👀 View stored codes (requires password)\
-   📋 List all saved titles\
-   🗑 Delete a title and its codes\
-   💾 Local-first JSON storage (ChronoDB)\
-   🛡 Persistent brute-force lock (3 failed attempts → 30s lock)\
-   🔐 Masked password input (hidden typing with backspace support)

------------------------------------------------------------------------

## 📦 Installation

### 1️⃣ Clone the repository

``` bash
git clone <your-repo-url>
cd vault
```

### 2️⃣ Install dependencies

Using pnpm:

``` bash
pnpm install
```

Or using npm:

``` bash
npm install
```

### 3️⃣ Build the project

``` bash
pnpm run build
# or
npm run build
```

------------------------------------------------------------------------

## 🚀 Usage

Run the CLI:

``` bash
pnpm run start -- <command>
# or
node dist/index.js <command>
```

------------------------------------------------------------------------

## 📚 Commands

### ➕ Add Codes

``` bash
vault add "Paystack-Recovery-Codes"
```

You will be prompted to:

1.  Enter your master password\
2.  Enter codes line by line\
3.  Press Enter on an empty line to finish

------------------------------------------------------------------------

### 👀 View Codes

``` bash
vault view "Paystack-Recovery-Codes"
```

You must enter the correct master password to decrypt and display the
codes.

If you fail 3 times, the vault is locked for 30 seconds.

------------------------------------------------------------------------

### 📋 List Titles

``` bash
vault list
```

Displays all saved titles.

------------------------------------------------------------------------

### 🗑 Delete a Title

``` bash
vault delete "Paystack-Recovery-Codes"
```

Requires master password confirmation before deletion.

------------------------------------------------------------------------

## 📁 Project Structure

    vault/
    ├─ src/
    │  ├─ cli.ts
    │  ├─ index.ts
    │  ├─ vault/
    │  │  ├─ vault.ts
    │  │  └─ lockStore.ts
    │  └─ utils/
    │     ├─ input.ts
    │     └─ logger.ts
    ├─ dist/
    ├─ data/
    ├─ package.json
    ├─ tsconfig.json
    └─ README.md

------------------------------------------------------------------------

## ⚠️ Important

Do **NOT** commit the `data/` folder or `.vault-locks.json` file to
GitHub.

Add this to your `.gitignore`:

    data/
    .vault-locks.json

------------------------------------------------------------------------

## 🛠 Development

### Watch mode

``` bash
pnpm tsc --watch
```

### Run without building

``` bash
pnpm exec ts-node src/index.ts <command>
```

------------------------------------------------------------------------

## 🔐 Security

-   Codes are encrypted locally using your master password.
-   Data never leaves your machine.
-   Brute-force protection locks access after multiple failures.
-   Password input is masked in the terminal.

⚠️ If you lose your master password, your codes cannot be recovered.

------------------------------------------------------------------------

## 📜 License

MIT License
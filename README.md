# Gestione Fornitori

Applicazione per la gestione dei fornitori e delle spese.

## Istruzioni per il Deploy su Vercel

### Metodo 1: Deploy Tramite CLI

1. Installare Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Accedere a Vercel:
   ```bash
   vercel login
   ```

3. Eseguire il deploy:
   ```bash
   vercel --prod -e NEXT_PUBLIC_SUPABASE_URL=https://goniakzrtvzczdainfkf.supabase.co -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvbmlha3pydHZ6Y3pkYWluZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDk3MTIsImV4cCI6MjA1OTA4NTcxMn0.uXXHBXoJCtVoSxNxeFsVppi_uQyo2lqZXm5uKvGBs3A
   ```

### Metodo 2: Deploy Tramite Interfaccia Web Vercel

1. Vai su [Vercel](https://vercel.com) e accedi al tuo account
2. Clicca su "Add New Project"
3. Importa il repository dalla piattaforma Git (GitHub, GitLab, ecc.) o carica la cartella del progetto
4. Configura le variabili d'ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://goniakzrtvzczdainfkf.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvbmlha3pydHZ6Y3pkYWluZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDk3MTIsImV4cCI6MjA1OTA4NTcxMn0.uXXHBXoJCtVoSxNxeFsVppi_uQyo2lqZXm5uKvGBs3A`
5. Clicca su "Deploy"

## Credenziali di Accesso

- Username: `edoardo`
- Password: `edoardO2024`

## Funzionalità

- Gestione dei fornitori
- Registrazione e modifica delle spese
- Visualizzazione delle spese per fornitore e periodo
- Esportazione dei dati in Excel
- Cambio anno di visualizzazione

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

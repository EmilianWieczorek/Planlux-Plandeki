# PLANLUX PRODUKCJA PLANDEK

Wewnętrzna aplikacja desktopowa (Electron) oparta o Next.js 14 (App Router) + Supabase. Służy do obsługi produkcji plandek (ERP).

## Wymagania

- Node.js (zalecane LTS)
- npm (wraz z Node.js)
- Git (do pracy z repozytorium)

## Instalacja

```bash
npm install
```

## Konfiguracja środowiska (Supabase)

Sekrety **nie trafiają do repo**. Skopiuj plik przykładowy i uzupełnij wartości z Supabase Dashboard → Settings → API.

- **Windows (PowerShell)**:

```powershell
Copy-Item .env.local.example .env.local
```

Następnie uzupełnij w `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Uruchomienie lokalne

```bash
npm run dev
```

> Jeśli projekt ma osobny tryb uruchomienia Electron (np. `npm run electron`), sprawdź dostępne skrypty w `package.json`.

## Struktura katalogów (skrót)

- `src/` — kod aplikacji Next.js (App Router, Server Actions, UI)
- `electron/` — integracja/otoczka desktopowa Electron
- `docs/` — dokumentacja techniczna (m.in. SQL do RLS/polityk Supabase)

## Najczęstsze komendy

```bash
npm run dev
npm run build
npm run start
```

## Bezpieczeństwo

- **Nie commitujemy**: `.env.local`, żadnych tokenów/kluczy, buildów (`.next/`, `dist/`), cache (`node_modules/`).
- Do repo trafiają wyłącznie pliki przykładowe: `.env.example` / `.env.local.example` (bez sekretów).



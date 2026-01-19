/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_FOOTBALL_KEY: string;
  readonly VITE_API_FOOTBALL_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

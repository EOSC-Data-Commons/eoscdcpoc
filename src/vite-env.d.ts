/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MATOMO_CONTAINER_URL: string;
  // Add other VITE_ prefixed env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

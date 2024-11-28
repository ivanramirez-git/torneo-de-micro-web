/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ACKEE_SERVER: string
    readonly VITE_ACKEE_DOMAIN_ID: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
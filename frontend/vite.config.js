import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Nécessaire pour Docker
    port: 5173,
    watch: {
      usePolling: true, // Assure le rafraîchissement automatique sur certains OS
    },
    historyApiFallback: true, // Permet l'actualisation sur les routes React (ex: /feed, /profile)
  },
});

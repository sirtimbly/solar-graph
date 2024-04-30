// https://vitejs.dev/config/


import { defineConfig } from "vite";




export default defineConfig({

  plugins: [],
  server: {
    proxy: {
      '/cc': {
        secure: false,
        target: "https://testing.dynamicdataconcepts.com/sysapi/api/payform/creditcardpayment",
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {

    },
  },
});

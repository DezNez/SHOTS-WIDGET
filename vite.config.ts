import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  // ИЗМЕНЕНО: Имя твоего репозитория на GitHub (обязательно со слэшами по краям)
  base: '/SHOTS-WIDGET/', 
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        control: resolve(import.meta.dirname, 'control.html'),
      },
    },
  },
})
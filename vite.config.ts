import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from "@tresjs/core";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/EMDR_2/",
  plugins: [
    vue({
      ...templateCompilerOptions,
    }),
  ],
});

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import hangulscript from '@uiwwsw/hangulscript/vite';

export default defineConfig({ plugins: [hangulscript(), vue()] });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import hangulscript from '@uiwwsw/hangulscript/vite';

export default defineConfig({ plugins: [hangulscript(), react()] });

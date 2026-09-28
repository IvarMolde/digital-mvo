import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relativ base gjør at dist/ kan legges i hvilken som helst mappe på en webserver.
export default defineConfig({
  base: './',
  plugins: [react()],
});

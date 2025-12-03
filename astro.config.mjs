// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// GitHub Pages solo sirve contenido estático.
// Cambiamos a output 'static' y eliminamos el adapter de Node.
export default defineConfig({
  output: 'static'
});

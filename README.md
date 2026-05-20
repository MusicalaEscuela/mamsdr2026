# Salvémoslos del Reggaetón 2026 · Especial Michael Jackson

Página web estática para uso administrativo de Musicala y Full 80s.

## Qué incluye

- Minuto a minuto del evento desde la 1:00 p. m.
- Presentaciones Musicala desde las 2:00 p. m.
- Setlists de las bandas:
  - Banda adultos · The Office
  - Banda jóvenes · Young Metal
- Propuesta formal de actividades Musicala:
  - La banda del público
  - Michael Jackson Challenge
- Resumen ejecutivo comparativo.
- Roles sugeridos y alertas logísticas.
- Seguimiento local por bloque: estado, notas y checklist.
- Bloque pendiente para confirmar la banda tributo Michael Jackson por parte de Full 80s.
- Botones para imprimir/PDF, copiar resumen y exportar estado.

## Acceso

La página abre directamente en el navegador, sin clave de acceso. Está pensada como documento operativo interno para Musicala y Full 80s.

## Logos

El proyecto trae archivos con estos nombres en la carpeta `assets`:

- `logo.png`
- `logo_f80.png`
- `LOGO_SDR.png`

Los logos están incluidos en la carpeta `assets`. Si necesitan actualizarlos, basta con reemplazar los archivos manteniendo exactamente los mismos nombres.

## Cómo editar agenda, actividades y textos

Todo el contenido principal está en:

```txt
data.js
```

Ahí puedes ajustar:

- horarios
- responsables
- checklist
- setlists
- actividades
- alertas logísticas
- texto formal de presentación
- objetivo general
- bloque pendiente de la banda tributo Michael Jackson de Full 80s

## Cómo usar

1. Descomprimir el ZIP.
2. Abrir `index.html` en el navegador.
3. Editar `data.js` si se quieren cambiar horarios o textos.
4. Para publicar en GitHub Pages, subir todos los archivos a un repositorio y activar Pages desde la rama correspondiente.

## Estructura

```txt
salvemoslos-reggaeton-2026-full80s-admin/
├─ index.html
├─ styles.css
├─ app.js
├─ data.js
├─ README.md
└─ assets/
   ├─ favicon.svg
   ├─ logo.png
   ├─ logo_f80.png
   └─ LOGO_SDR.png
```

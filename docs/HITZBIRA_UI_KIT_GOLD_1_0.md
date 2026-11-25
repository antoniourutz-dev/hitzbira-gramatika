# HB-UI-001 · HITZBIRA UI KIT GOLD 1.0
Estado: candidato para revisión. Base real Gramatika 2.0.1, 897ae2b6d8e9e5f10191835ea7d8c21f92da5eb2. Rama feature/hb-ui-kit-gold-1. No cambios en main, bancos, lógica de corrección, Supabase ni datos. No migración de datos locales entre dominios; se recomienda probar en invitado.
## Entrega
- ui-kit/tokens.css: paleta, espaciado conceptual, radios, tiempos.
- ui-kit/app.css: adaptador visual de inicio, catálogo, ficha, sesión, laboratorio, atlas, navegación y tablas/verbos existentes. No sustituye la estructura ni lógica.
- ui-kit/integration.js: cuatro pictogramas de Icon System en navegación, sin cambiar eventos.
- ui-kit/index.html: catálogo y componentes interactivos; enlaces al recorrido real.
- ui-kit/manifest.json: contrato/versiones y límites.
## Decisiones
Se conserva tipografía existente Plus Jakarta Sans, Bira v0.2, atlas e ilustraciones ya integradas. Los nuevos 27 SVG de Illustration System no sustituyen el atlas ni las escenas en esta ronda. El sonido del catálogo es una muestra sintetizada del motivo de Sound Identity, no los WAV exactos ni integración de feedback real. El sonido en la aplicación real no se activa hasta validar bloqueo en SIMULATU/Entzumena/Mintzamena. Animaciones de entrada de Bira en inicio desactivadas; cambios de estado y progreso breves, reduced motion. Conserva labels existentes Hasiera/Ikasi/Praktikatu/Nire bidea.
## Calidad
SUSTRAI 00, 01, 04, 05 y 07: conservar la semántica y distinción entre error, variante, estilo y evidencia insuficiente. La demo no evalúa euskera oficialmente. No se afirma WCAG, rendimiento ni prueba con usuarios. Revisar inicio, catálogo, ficha, práctica, verbos, viaje, dark mode, teclado, móvil y audio antes de merge. Comparar a 375/768/1440 y 200% zoom. Probar sesión de invitado y no usar cuentas reales en la preview antes de validar aislamiento.

## 1.0.1 — revisión tras feedback visual
Se elimina la sobrescritura de la bienvenida (fondo dividido, tamaño de Bira, tipografía y botón), conservando el degradado y composición originales. Se recupera una anchura de inicio de 1100 px, ajustando tarjetas narrativas al espaciado previo. Bira permanece estática. Nire bidea: icono escalonado con bandera de destino, trazo 1,8, caja 24×24, aplicado en navegación móvil/escritorio y catálogo. Ninguna modificación en motor ni datos. Pendiente prueba visual de legibilidad.

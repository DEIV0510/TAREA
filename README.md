# AD BATTLE — La Batalla de las Agencias 📣

Juego web por equipos para la clase de **Mercadeo y Publicidad**. Todas las preguntas salen de la exposición
**«La publicidad»** (qué es, características, cifras y estrategias según el objetivo y el canal).
La partida dura **máximo 10 minutos**: hay un reloj arriba y, si llega a cero, se pasa directo a la Gran Final.

## Cómo se juega

1. **Equipos**: de 2 a 6 agencias, cada una con nombre, integrantes, avatar y color. Todas empiezan con una carta de poder.
2. **Nivel 1 — Detective publicitario 🔎** (por turnos): cada equipo recibe un minijuego distinto:
   pregunta detective, anuncio misterioso, mito o realidad, caso práctico, conecta las ideas, el intruso,
   clasifica rápido y ordena la jugada. El número de retos por equipo se ajusta solo al número de equipos
   para que la partida quepa en 10 minutos.
3. **Nivel 2 — Creadores de campañas 🎨** (todos a la vez): un mismo producto para todas las agencias.
   60 segundos para elegir objetivo (informar, persuadir, recordar o emocionar), público, tono, canal y CTA;
   cada agencia anota sus letras, el profe las ingresa y el juego calcula el **ÍNDICE DE CAMPAÑA**.
4. **Nivel 3 — El cliente final 👑** (todos a la vez): un brief con cliente, presupuesto y problema;
   6 decisiones en 60 segundos y evaluación en creatividad, estrategia, público, canal y conversión.
5. **Gran Final 🏆**: campeón, segundo y tercer lugar, estadísticas y confeti.

**Puntos**: correcta +100 · rápida +50 · combo x2/x3/x4 +50/+100/+150 · incorrecta 0 (sin castigo) ·
índice de campaña × 10 · puntuación del brief × 15 · mejor campaña +150.

**Cartas de poder**: 🔥 Doble puntos · ⏰ +15 segundos · 🛡️ Escudo · 🎯 Robo de puntos · ⚡ Respuesta rápida.
Se ganan con rachas, con campañas de 90+ y en la tienda opcional (con monedas 🪙).

**Modo profesor 🎓**: pausar el tiempo (se pausa solo al abrir el panel), saltar pregunta, avanzar de nivel,
sumar o quitar puntos y monedas, dar cartas, editar equipos, reiniciar partida o ranking, sonido y animaciones suaves.
Todo se guarda en `localStorage`: si se recarga la página, la partida sigue donde iba.

**Atajos de teclado**: Enter = continuar · 1-4 o A-D = opciones · M/R = mito o realidad · ← → = clasificar.

## Tecnología

React 19 + TypeScript + Tailwind CSS 4 + Framer Motion + Lucide React (Vite). Sonidos sintetizados con Web Audio
(sin archivos) y confeti con `canvas-confetti`.

```
src/
  data/        contenido: level1 (retos de la exposición), level2 (productos), level3 (briefs), cartas, equipos
  game/        motor (reducer puro), puntuación, reloj de la partida, persistencia
  components/  mascota Megi, botones, ranking en vivo, modo profesor, anuncios ficticios
  screens/     inicio, equipos, niveles, minijuegos, campañas en grupo, tienda, gran final
  lib/         sonido y efectos (confeti, "+100" que vuela al marcador, banners)
```

## Comandos

```bash
npm install
npm run dev          # http://localhost:5451
npm run build        # dist/  (sitio para publicar)
npm run build:single # dist-single/index.html (un solo archivo, se abre sin servidor)
```

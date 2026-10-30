# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Implemented
> **Depends on:** None
> **Date:** 2026-10-30
> **Objective:** Construir un Arkanoid de un nivel, jugable en el navegador con teclado o ratón.

## Scope

**In:**

- `index.html` en la raíz con un canvas fijo de 800x600 centrado en la página.
- `src/game.js` como script clásico, sin módulos, sin dependencias y sin build.
- Un nivel de 12 columnas y 6 filas, con 72 bloques que se rompen de un golpe.
- Paleta controlada con flechas, con A/D o con el ratón.
- Pelota que espera sobre la paleta hasta pulsar Espacio o hacer clic.
- Rebote en la paleta con un ángulo que depende del punto de impacto.
- 10 puntos por bloque y 3 vidas, visibles en el marcador.
- Pantallas de victoria y de game over, con reinicio mediante Espacio o clic.
- Animación de explosión de bloques con `EXPLOSION_FRAMES`.
- Sonidos `ball-bounce.mp3` y `break-sound.mp3`.
- Crédito visible a Petraheim, en un texto bajo el canvas.

**Out of scope (for future specs):**

- Pausa.
- Récord guardado o cualquier otra persistencia.
- Varios niveles.
- Bloques grises o bloques con resistencia.
- Aumento de la velocidad de la pelota.
- Canvas adaptable al tamaño de la ventana.
- Controles táctiles.
- Tests automatizados.

## Data model

```js
// src/game.js
const state = {
  status: "serving", // 'serving' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 560, w: 162, h: 14 },
  ball: { x: 392, y: 544, size: 16, vx: 0, vy: 0 },
  blocks: [
    /* { x, y, w: 64, h: 32, color, alive: true } */
  ],
  explosions: [
    /* { x, y, color, elapsed: 0 } */
  ],
};
```

Conventions:

- Coordenadas con origen arriba a la izquierda, en píxeles del canvas.
- `x` e `y` son la esquina superior izquierda de cada elemento.
- Velocidades en píxeles por segundo.
- Tiempo de cada actualización limitado a 1/30 s.
- Velocidad de la pelota: 360 px/s, constante.
- Velocidad de la paleta con teclado: 600 px/s.
- Ángulo de rebote en la paleta: de 0° en el centro a 60° respecto a la vertical en los extremos.
- Lanzamiento: siempre hacia arriba, a 30° de la vertical hacia la derecha.
- La cuadrícula empieza en `x = 16`, `y = 60`, sin separación entre bloques.
- Orden de filas, de arriba abajo: `red`, `hotpink`, `yellow`, `cyan`, `green`, `magenta`.
- Por el desfase de claves del sheet, esas filas se ven roja, naranja, amarilla, verde azulada, azul y morada.

## Implementation plan

1. Crear `index.html` con el canvas, el crédito y los scripts `assets/spritesheet.js` y `src/game.js`. Crear `src/game.js` para que muestre "Cargando…" y llame a `loadSpritesheet`. Prueba manual: abrir la página y ver el canvas y el crédito.
2. Definir `state` y la creación de los 72 bloques. Dibujar bloques, paleta, pelota y marcador. Prueba manual: ver el nivel completo y estático.
3. Añadir el bucle con `requestAnimationFrame` y el movimiento de la paleta con teclado y ratón, limitado a los bordes. Prueba manual: mover la paleta de las tres formas.
4. Añadir el lanzamiento con Espacio o clic, el movimiento de la pelota, los rebotes en paredes y techo, y la pérdida de vida al salir por abajo. Prueba manual: la pelota vuelve a la paleta y las vidas bajan.
5. Añadir la colisión con la paleta y el ángulo según el punto de impacto. Solo cuenta si la pelota baja. Prueba manual: los extremos desvían más que el centro.
6. Añadir la colisión con bloques, como máximo una por actualización, invirtiendo el eje de menor solapamiento. Sumar 10 puntos y pasar a `won` sin bloques vivos. Prueba manual: los bloques desaparecen y los puntos suben.
7. Dibujar los mensajes de `serving`, `won` y `lost`. Reiniciar la partida con Espacio o clic desde `won` o `lost`. Prueba manual: terminar una partida y empezar otra.
8. Añadir las explosiones de 4 cuadros en 150 ms en total (`EXPLOSION_DURATION`), solo decorativas. Prueba manual: cada bloque roto se anima y deja de chocar al instante.
9. Añadir los sonidos: `ball-bounce.mp3` en paredes, techo y paleta, y `break-sound.mp3` en bloques. Reiniciar `currentTime` antes de cada reproducción y capturar el error de `play()`. Prueba manual: rebotes rápidos suenan sin errores en consola.
10. Actualizar "Project state" y "Assets" en `CLAUDE.md`: entrada del juego y forma de ejecutarlo. Prueba manual: el texto coincide con los archivos.

## Acceptance criteria

- [ ] Abrir `index.html` directamente, sin servidor y sin instalar nada, inicia el juego sin errores en la consola.
- [ ] El canvas mide 800x600 y el crédito a Petraheim se ve debajo.
- [ ] Al empezar hay 72 bloques en 6 filas de 12, con 3 vidas y 0 puntos.
- [ ] Flechas, A/D y ratón mueven la paleta, y esta nunca sale del canvas.
- [ ] La pelota sigue a la paleta hasta pulsar Espacio o hacer clic.
- [ ] La pelota rebota en las paredes laterales, en el techo y en la paleta.
- [ ] Golpear la paleta cerca de un extremo desvía la pelota hacia ese lado más que golpearla en el centro.
- [ ] Romper un bloque suma exactamente 10 puntos y reproduce su explosión y `break-sound.mp3`.
- [ ] Rebotar en paredes, techo o paleta reproduce `ball-bounce.mp3`.
- [ ] Perder la pelota resta una vida, conserva los bloques rotos y devuelve la pelota a la paleta.
- [ ] Perder la tercera vida muestra la pantalla de game over.
- [ ] Romper los 72 bloques da 720 puntos y muestra la pantalla de victoria.
- [ ] Espacio o clic desde cualquiera de esas dos pantallas restaura 72 bloques, 3 vidas y 0 puntos.
- [ ] Espacio y las flechas no desplazan la página.

## Decisions

- **Yes:** JavaScript sin build, con `<script>`. Reutiliza `spritesheet.js` sin cambios y funciona abriendo el archivo.
- **No:** módulos ES. Obligan a convertir `spritesheet.js` y a servir la página por HTTP.
- **No:** Vite y TypeScript. Añaden dependencias y build a un MVP pequeño.
- **Yes:** teclado y ratón. Cuesta poco código y permite jugar de ambas formas.
- **Yes:** un nivel y 3 vidas. Basta para tener una partida completa.
- **No:** varios niveles. Exigen diseños y transiciones que pueden esperar.
- **Yes:** canvas fijo de 800x600 con bloques a 64x32. Es la escala 2x exacta del sprite y 12 columnas dejan márgenes de 16 px.
- **No:** canvas adaptable. Exige convertir las coordenadas del ratón.
- **Yes:** paleta a su tamaño original de 162x14. No deforma el sprite.
- **Yes:** seis filas de un golpe, sin grises. Simplifica la lógica y evita que un bloque gris explote en rojo.
- **No:** patrón con huecos. Es más vistoso, pero no aporta a la jugabilidad básica.
- **Yes:** velocidad constante de la pelota. Mantiene predecible la dificultad del MVP.
- **Yes:** 10 puntos fijos por bloque y reinicio sin recargar. Es la regla más simple que permite volver a jugar.
- **No:** puntos por fila. Añade reglas sin cambiar la jugabilidad.
- **Yes:** `EXPLOSION_DURATION` es la duración total de la animación. El nombre apunta a eso y el código existente no lo usa.
- **Yes:** los bloques dejan de chocar al romperse. La explosión es solo visual y no afecta a la pelota.

## Risks

| Risk                                                       | Mitigation                                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Falla la carga de la spritesheet                           | `loadSpritesheet` registra el error en consola y el canvas se queda en "Cargando…", sin arrancar el bucle. |
| Falla la carga o reproducción de un sonido                 | El error de `play()` se captura y la partida sigue sin ese sonido.                                         |
| La pelota atraviesa un bloque tras una pausa del navegador | El límite de 1/30 s reduce el avance a 12 px por actualización, menos que el alto de un bloque.            |
| La pelota queda en vertical si golpea el centro exacto     | El jugador puede cambiar el ángulo moviendo la paleta antes del siguiente golpe.                           |

## What is **not** in this spec

- Pausa.
- Récord guardado o persistencia.
- Varios niveles.
- Bloques grises o con resistencia.
- Aceleración de la pelota.
- Canvas adaptable o controles táctiles.
- Tests automatizados.

Each one of those, if it lands, goes in its own spec.

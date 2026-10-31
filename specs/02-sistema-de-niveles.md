# SPEC 02 — Sistema de niveles

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-10-30
> **Objective:** Convertir la partida de un nivel en una progresión de 3 niveles con diseños de bloques distintos y una pelota cada vez más rápida.

## Scope

**In:**

- Tres niveles jugados en orden: muro, pirámide y ajedrez.
- Velocidad de la pelota por nivel: 360, 420 y 480 px/s.
- Nuevo estado `levelComplete`, con el mensaje "Nivel N completado".
- Paso al nivel siguiente con Espacio o clic.
- Puntos y vidas que se conservan entre niveles.
- Pantalla de victoria solo al completar el nivel 3.
- Reinicio en el nivel 1, con 3 vidas y 0 puntos, desde victoria o game over.
- Texto "Nivel: N" centrado en la parte superior del marcador.

**Out of scope (for future specs):**

- Más de 3 niveles o ciclo infinito.
- Bloques grises o con resistencia.
- Vidas extra al completar un nivel.
- Transición automática o con temporizador.
- Selección de nivel.
- Guardar el progreso o cualquier otra persistencia.
- Tests automatizados.

## Data model

```js
// src/game.js
const LEVELS = [
  {
    ballSpeed: 360,
    map: [
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
    ],
  },
  {
    ballSpeed: 420,
    map: [
      ".....XX.....",
      "....XXXX....",
      "...XXXXXX...",
      "..XXXXXXXX..",
      ".XXXXXXXXXX.",
      "XXXXXXXXXXXX",
    ],
  },
  {
    ballSpeed: 480,
    map: [
      "X.X.X.X.X.X.",
      ".X.X.X.X.X.X",
      "X.X.X.X.X.X.",
      ".X.X.X.X.X.X",
      "X.X.X.X.X.X.",
      ".X.X.X.X.X.X",
    ],
  },
];

const state = {
  status: "serving", // 'serving' | 'playing' | 'levelComplete' | 'won' | 'lost'
  level: 1, // Nivel actual, de 1 a LEVELS.length
  // El resto de campos no cambia respecto a SPEC 01.
};
```

Conventions:

- `X` es un bloque y `.` es un hueco.
- Cada mapa tiene 6 filas de 12 caracteres.
- El color de un bloque depende de su fila y sigue el orden de `BLOCK_ROWS`.
- La posición de cada celda sigue la cuadrícula de SPEC 01, también en los huecos.
- Los niveles tienen 72, 42 y 36 bloques, 150 en total.
- A 10 puntos por bloque, los niveles dan 720, 420 y 360 puntos, 1500 en total.
- La velocidad de la pelota es constante dentro de cada nivel.
- `BALL_SPEED` desaparece y se sustituye por `LEVELS[ state.level - 1 ].ballSpeed`.

## Implementation plan

1. Añadir `LEVELS` y `state.level`, y hacer que `createBlocks` genere los bloques desde el mapa del nivel actual. Prueba manual: el nivel 1 se ve igual que antes, con 72 bloques.
2. Sustituir `BALL_SPEED` por la velocidad del nivel actual en `launchBall` y `bounceOffPaddle`. Prueba manual: el nivel 1 se juega a la misma velocidad.
3. Dibujar "Nivel: N" centrado en `drawHud`, a la misma altura que Puntos y Vidas. Prueba manual: el texto no se solapa con Puntos ni con Vidas.
4. Añadir el estado `levelComplete` y su mensaje. En `hitBlock`, pasar a `levelComplete` si quedan niveles y a `won` si era el último. Prueba manual: al vaciar el nivel 1 aparece "Nivel 1 completado" y la pelota vuelve a la paleta.
5. Hacer que `handleAction` pase desde `levelComplete` al nivel siguiente: aumenta `level`, crea sus bloques, vacía `explosions` y vuelve a `serving`. Prueba manual: se ve la pirámide y la pelota sale a 420 px/s.
6. Hacer que `restartGame` vuelva a `level = 1` y cree los bloques de ese nivel. Prueba manual: perder en el nivel 2 y reiniciar devuelve el muro, 3 vidas y 0 puntos.

Para probar sin romper todos los bloques, ejecutar en la consola `state.blocks.slice( 1 ).forEach( block => block.alive = false )` y romper el bloque que queda. Debe quedar vivo el primer bloque del array.

## Acceptance criteria

- [ ] Al empezar, el marcador muestra "Nivel: 1" centrado, y hay 72 bloques, 3 vidas y 0 puntos.
- [ ] El nivel 2 tiene 42 bloques en forma de pirámide, según su mapa.
- [ ] El nivel 3 tiene 36 bloques en forma de ajedrez, según su mapa.
- [ ] En cada nivel, `Math.hypot( state.ball.vx, state.ball.vy )` da 360, 420 y 480 respectivamente mientras la pelota está en juego.
- [ ] Romper el último bloque de los niveles 1 y 2 muestra "Nivel N completado", con el número del nivel terminado.
- [ ] Durante `levelComplete`, la pelota está quieta sobre la paleta y la paleta se puede mover.
- [ ] Espacio o clic desde `levelComplete` carga el nivel siguiente, con la pelota esperando el lanzamiento.
- [ ] Puntos y vidas no cambian al pasar de nivel.
- [ ] Perder la pelota en los niveles 2 o 3 resta una vida y conserva el nivel y los bloques rotos.
- [ ] Romper el último bloque del nivel 3 muestra la pantalla de victoria.
- [ ] Completar los 3 niveles da 1500 puntos.
- [ ] Perder la última vida en cualquier nivel muestra la pantalla de game over.
- [ ] Espacio o clic desde victoria o game over restaura el nivel 1, con 72 bloques, 3 vidas y 0 puntos.
- [ ] Una partida completa no produce errores en la consola.

## Decisions

- **Yes:** 3 niveles con victoria final. Bastan para probar el sistema con una partida corta.
- **No:** 5 niveles. Exigen más diseños sin añadir nada al sistema.
- **No:** ciclo infinito. Elimina la victoria y obliga a definir una velocidad sin límite.
- **Yes:** cambiar diseño y velocidad. Da progresión de dificultad sin mecánicas nuevas.
- **No:** bloques con resistencia. Son una mecánica aparte y merecen su propia spec.
- **Yes:** muro, pirámide y ajedrez. El muro conserva el inicio actual y los otros dos abren huecos que cambian los rebotes.
- **No:** columnas y marco como niveles 2 y 3. Se consideraron y se descartaron en favor de pirámide y ajedrez.
- **Yes:** 360, 420 y 480 px/s. El nivel 1 no cambia y el último es un 33 % más rápido.
- **No:** 360, 390 y 420 px/s. El cambio entre niveles se nota menos.
- **No:** 360, 450 y 540 px/s. La dificultad sube demasiado para una partida de 3 niveles.
- **Yes:** pantalla intermedia con Espacio o clic. El jugador decide cuándo seguir y reutiliza `drawMessage`.
- **No:** transición automática o inmediata. La primera exige un temporizador y la segunda no da respiro.
- **Yes:** conservar puntos y vidas. La partida es una sola y las vidas perdidas pesan hasta el final.
- **No:** vida extra por nivel. Añade una regla que se puede evaluar más adelante.
- **No:** restaurar 3 vidas en cada nivel. Hace la partida más fácil.
- **Yes:** `LEVELS` en `src/game.js`. Sigue el patrón de constantes del archivo y no toca `index.html`.
- **No:** `src/levels.js`. Son pocos datos y exigiría otra etiqueta `<script>`.
- **Yes:** "Nivel: N" sin el total. Es más corto y mantiene el marcador simple.
- **No:** "Nivel: N/3". Se consideró y se descartó.
- **Yes:** mantener el mensaje de `serving` sin cambios. El marcador ya indica el nivel.
- **Yes:** la paleta no se recoloca al cambiar de nivel. Reposicionarla no aporta nada y el ratón la movería de todos modos.

## Risks

| Risk                                                       | Mitigation                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| La pelota atraviesa un bloque o la paleta a 480 px/s       | El límite de 1/30 s reduce el avance a 16 px por actualización, menos que el alto de un bloque y que el margen de 30 px de la paleta. |
| Una explosión del nivel anterior se dibuja en el siguiente | Pasar de nivel vacía `explosions`.                                                                                                    |
| Espacio mantenido salta la pantalla de nivel completado    | El manejador de teclado ya ignora `event.repeat`.                                                                                     |

## What is **not** in this spec

- Más de 3 niveles o ciclo infinito.
- Bloques grises o con resistencia.
- Vidas extra.
- Transición automática.
- Selección de nivel.
- Persistencia del progreso.
- Tests automatizados.

Each one of those, if it lands, goes in its own spec.

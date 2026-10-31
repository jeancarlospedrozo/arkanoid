# Arkanoid

Juego de Arkanoid/Breakout para el navegador, escrito en JavaScript sin dependencias.

## Cómo jugar

Abre `index.html` en el navegador. No hace falta servidor, instalación ni build.

| Acción         | Controles             |
| -------------- | --------------------- |
| Mover la paleta | Flechas, A/D o ratón  |
| Lanzar la pelota | Espacio o clic        |
| Continuar o reiniciar | Espacio o clic        |

## Reglas

- La partida tiene 3 niveles, que se juegan en orden.
- Cada bloque roto suma 10 puntos, hasta un total de 1500.
- Empiezas con 3 vidas y pierdes una cada vez que la pelota sale por abajo.
- Puntos y vidas se conservan al pasar de nivel.
- Completar el nivel 3 da la victoria.
- Perder la última vida termina la partida, y la siguiente empieza en el nivel 1.

| Nivel | Diseño   | Bloques | Velocidad de la pelota |
| ----- | -------- | ------- | ---------------------- |
| 1     | Muro     | 72      | 360 px/s               |
| 2     | Pirámide | 42      | 420 px/s               |
| 3     | Ajedrez  | 36      | 480 px/s               |

## Estructura

```
index.html             Página de entrada y canvas de 800x600
src/game.js            Lógica del juego y definición de niveles
assets/spritesheet.js  API de sprites
assets/sounds/         Efectos de sonido
specs/                 Especificaciones de cada funcionalidad
```

## Desarrollo

Las funcionalidades se construyen a partir de especificaciones, con `/spec` y `/spec-impl` en Claude Code. El proceso completo está en [CLAUDE.md](CLAUDE.md).

No hay tests automatizados, así que los cambios se verifican a mano en el navegador.

## Créditos

Gráficos: Petraheim.

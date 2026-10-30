const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const BLOCK_COLUMNS = 12;
const BLOCK_ROWS = [ 'red', 'hotpink', 'yellow', 'cyan', 'green', 'magenta' ];
const BLOCK_WIDTH = 64;
const BLOCK_HEIGHT = 32;
const BLOCKS_X = 16;
const BLOCKS_Y = 60;
const PADDLE_SPEED = 600;
const BALL_SPEED = 360;
const LAUNCH_ANGLE = Math.PI / 6;
const MAX_BOUNCE_ANGLE = Math.PI / 3;
const BLOCK_POINTS = 10;
const MAX_DELTA = 1 / 30;

const STATUS_MESSAGES = {
  serving: { title: 'Arkanoid', hint: 'Pulsa Espacio o haz clic para lanzar' },
  won: { title: '¡Victoria!', hint: 'Pulsa Espacio o haz clic para jugar de nuevo' },
  lost: { title: 'Game over', hint: 'Pulsa Espacio o haz clic para jugar de nuevo' },
};

const LEFT_KEYS =[ 'ArrowLeft', 'KeyA' ];
const RIGHT_KEYS = [ 'ArrowRight', 'KeyD' ];
const pressedKeys = new Set();

const bounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/sounds/break-sound.mp3' );

function playSound( sound ) {
  sound.currentTime = 0;
  sound.play().catch( error => console.warn( 'No se pudo reproducir un sonido', error ) );
}

function createBlocks() {
  const blocks = [];
  BLOCK_ROWS.forEach( ( color, row ) => {
    for ( let column = 0; column < BLOCK_COLUMNS; column++ ) {
      blocks.push( {
        x: BLOCKS_X + column * BLOCK_WIDTH,
        y: BLOCKS_Y + row * BLOCK_HEIGHT,
        w: BLOCK_WIDTH,
        h: BLOCK_HEIGHT,
        color,
        alive: true,
      } );
    }
  } );
  return blocks;
}

const state = {
  status: 'serving', // 'serving' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 560, w: 162, h: 14 },
  ball: { x: 392, y: 544, size: 16, vx: 0, vy: 0 },
  blocks: createBlocks(),
  explosions: [],
};

function drawLoading() {
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText( 'Cargando…', canvas.width / 2, canvas.height / 2 );
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText( `Puntos: ${ state.score }`, BLOCKS_X, 30 );
  ctx.textAlign = 'right';
  ctx.fillText( `Vidas: ${ state.lives }`, canvas.width - BLOCKS_X, 30 );
}

function drawMessage() {
  const message = STATUS_MESSAGES[ state.status ];
  if ( !message ) return;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '36px sans-serif';
  ctx.fillText( message.title, canvas.width / 2, 370 );
  ctx.font = '20px sans-serif';
  ctx.fillText( message.hint, canvas.width / 2, 420 );
}

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  state.blocks.forEach( block => {
    if ( block.alive ) drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.w, block.h );
  } );

  state.explosions.forEach( explosion => {
    const frames = EXPLOSION_FRAMES[ explosion.color ];
    const frame = frames[ Math.floor( explosion.elapsed / EXPLOSION_DURATION * frames.length ) ];
    drawFrame( ctx, frame, explosion.x, explosion.y, BLOCK_WIDTH, BLOCK_HEIGHT );
  } );

  const { paddle, ball } = state;
  drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h );
  drawSprite( ctx, 'ball', ball.x, ball.y, ball.size, ball.size );

  drawHud();
  drawMessage();
}

function movePaddleTo( x ) {
  state.paddle.x = Math.max( 0, Math.min( canvas.width - state.paddle.w, x ) );
}

function placeBallOnPaddle() {
  const { paddle, ball } = state;
  ball.x = paddle.x + ( paddle.w - ball.size ) / 2;
  ball.y = paddle.y - ball.size;
}

function launchBall() {
  state.ball.vx = BALL_SPEED * Math.sin( LAUNCH_ANGLE );
  state.ball.vy = -BALL_SPEED * Math.cos( LAUNCH_ANGLE );
  state.status = 'playing';
}

function restartGame() {
  state.status = 'serving';
  state.score = 0;
  state.lives = 3;
  state.blocks = createBlocks();
  state.explosions = [];
}

function handleAction() {
  if ( state.status === 'serving' ) launchBall();
  else if ( state.status === 'won' || state.status === 'lost' ) restartGame();
}

function loseLife() {
  state.lives--;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.status = state.lives > 0 ? 'serving' : 'lost';
}

function moveBall( delta ) {
  const { ball } = state;
  ball.x += ball.vx * delta;
  ball.y += ball.vy * delta;

  if ( ball.x < 0 ) {
    ball.x = 0;
    ball.vx = -ball.vx;
    playSound( bounceSound );
  } else if ( ball.x + ball.size > canvas.width ) {
    ball.x = canvas.width - ball.size;
    ball.vx = -ball.vx;
    playSound( bounceSound );
  }

  if ( ball.y < 0 ) {
    ball.y = 0;
    ball.vy = -ball.vy;
    playSound( bounceSound );
  } else if ( ball.y > canvas.height ) {
    loseLife();
  }
}

function overlaps( ball, rect ) {
  return ball.x < rect.x + rect.w && ball.x + ball.size > rect.x
    && ball.y < rect.y + rect.h && ball.y + ball.size > rect.y;
}

function bounceOffPaddle() {
  const { paddle, ball } = state;
  if ( ball.vy <= 0 || !overlaps( ball, paddle ) ) return;

  const ballCenter = ball.x + ball.size / 2;
  const paddleCenter = paddle.x + paddle.w / 2;
  const offset = ( ballCenter - paddleCenter ) / ( paddle.w / 2 );
  const angle = Math.max( -1, Math.min( 1, offset ) ) * MAX_BOUNCE_ANGLE;

  ball.vx = BALL_SPEED * Math.sin( angle );
  ball.vy = -BALL_SPEED * Math.cos( angle );
  ball.y = paddle.y - ball.size;
  playSound( bounceSound );
}

function bounceOffBlock( block ) {
  const { ball } = state;
  const overlapLeft = ball.x + ball.size - block.x;
  const overlapRight = block.x + block.w - ball.x;
  const overlapTop = ball.y + ball.size - block.y;
  const overlapBottom = block.y + block.h - ball.y;

  // Sacar la pelota del bloque evita que vuelva a rebotar en su vecino de fila o columna.
  if ( Math.min( overlapLeft, overlapRight ) < Math.min( overlapTop, overlapBottom ) ) {
    ball.x += overlapLeft < overlapRight ? -overlapLeft : overlapRight;
    ball.vx = -ball.vx;
  } else {
    ball.y += overlapTop < overlapBottom ? -overlapTop : overlapBottom;
    ball.vy = -ball.vy;
  }
}

function hitBlock() {
  const block = state.blocks.find( candidate => candidate.alive && overlaps( state.ball, candidate ) );
  if ( !block ) return;

  block.alive = false;
  state.score += BLOCK_POINTS;
  state.explosions.push( { x: block.x, y: block.y, color: block.color, elapsed: 0 } );
  playSound( breakSound );
  bounceOffBlock( block );

  if ( !state.blocks.some( candidate => candidate.alive ) ) {
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.status = 'won';
  }
}

function updateExplosions( delta ) {
  state.explosions.forEach( explosion => {
    explosion.elapsed += delta * 1000;
  } );
  state.explosions = state.explosions.filter( explosion => explosion.elapsed < EXPLOSION_DURATION );
}

function update( delta ) {
  updateExplosions( delta );

  const isPressed = key => pressedKeys.has( key );
  const direction = RIGHT_KEYS.some( isPressed ) - LEFT_KEYS.some( isPressed );
  if ( direction ) movePaddleTo( state.paddle.x + direction * PADDLE_SPEED * delta );

  if ( state.status === 'playing' ) {
    moveBall( delta );
    bounceOffPaddle();
    hitBlock();
  }
  if ( state.status !== 'playing' ) placeBallOnPaddle();
}

let lastTime = null;

function loop( time ) {
  const delta = lastTime === null ? 0 : Math.min( ( time - lastTime ) / 1000, MAX_DELTA );
  lastTime = time;

  update( delta );
  draw();
  requestAnimationFrame( loop );
}

window.addEventListener( 'keydown', event => {
  if ( event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'Space' ) event.preventDefault();
  if ( event.code === 'Space' && !event.repeat ) handleAction();
  pressedKeys.add( event.code );
} );

canvas.addEventListener( 'click', handleAction );

window.addEventListener( 'keyup', event => {
  pressedKeys.delete( event.code );
} );

window.addEventListener( 'blur', () => {
  pressedKeys.clear();
} );

window.addEventListener( 'mousemove', event => {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  movePaddleTo( mouseX - state.paddle.w / 2 );
} );

drawLoading();

loadSpritesheet( () => requestAnimationFrame( loop ) );

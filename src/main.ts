import { World } from './World/World';

document.querySelector('#h1')?.append('Exame CMC-30');

async function main() {
  const container = document.querySelector(
    '#scene-container',
  ) as HTMLCanvasElement;

  const world = new World(container);
  await world.init();
  world.start();

  // addEventListener('click', () => {
  //   if (world.isRunning() === false) {
  //     world.start();
  //   } else {
  //     world.stop();
  //   }
  // });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      world.startGame();
      world.startAccelerating();
      return;
    }
    if (event.key === 'ArrowDown') {
      world.startDeacelerating();
      return;
    }
    if (event.key === 'R' || event.key === 'r') {
      world.reset();
    }
  });
  window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
      world.stopAccelerating();
      return;
    }
    if (event.key === 'ArrowDown') {
      world.stopDeacelerating();
    }
  });
}

main().catch((err) => {
  console.log(err);
});

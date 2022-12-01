import { PerspectiveCamera } from 'three';

export const aspectRatio = window.innerWidth / window.innerHeight;
export const cameraWidth = 960;
export const cameraHeight = cameraWidth / aspectRatio;

function createCamera(): PerspectiveCamera {
  // const camera = new OrthographicCamera(
  //   cameraWidth / -2,
  //   cameraWidth / 2,
  //   cameraHeight / 2,
  //   cameraHeight / -2,
  //   0,
  //   1000
  // );
  const camera = new PerspectiveCamera(
    100,
    aspectRatio,
    50,
    1000,
  );
  camera.position.set(0, -20, 300);
  camera.lookAt(0, 0, 0);
  return camera;
}

export { createCamera };

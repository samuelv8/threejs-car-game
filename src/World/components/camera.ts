import { PerspectiveCamera } from 'three';

function createCamera(): PerspectiveCamera {
  const aspectRatio = window.innerWidth / window.innerHeight;
  // const cameraWidth = 960;
  // const cameraHeight = cameraWidth / aspectRatio;

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

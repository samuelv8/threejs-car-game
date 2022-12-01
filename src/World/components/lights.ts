import {
  AmbientLight,
  DirectionalLight,
} from 'three';

interface LightTypes {
  directionalLight: DirectionalLight;
  ambientLight: AmbientLight;
}

function createLights(): LightTypes {
  const ambientLight = new AmbientLight(0xffffff, 0.6);
  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(200, 500, 300);

  return { ambientLight, directionalLight };
}

export { createLights };

import {
  Group, Mesh, BoxBufferGeometry, MeshLambertMaterial, CanvasTexture, Vector2
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createWheels } from './wheels';
import { pickRandom } from '@/World/utils';

const cabinBaseColor = '#fff457';
const cabinWindowColor = '#666666';

function getCarFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext('2d');

  context.fillStyle = cabinBaseColor;
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = cabinWindowColor;
  context.fillRect(8, 8, 48, 24);

  return new CanvasTexture(canvas);
}

function getCarSideTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext('2d');

  context.fillStyle = cabinBaseColor;
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = cabinWindowColor;
  context.fillRect(10, 8, 60, 24);

  return new CanvasTexture(canvas);
}

async function createCar() {
  const loader = new GLTFLoader();

  const data = await loader.loadAsync('public/assets/models/car.gltf');
  (data).scene.scale.set(8, 8, 8);
  (data).scene.position.z = 10;
  (data).scene.rotateX(Math.PI / 2);
  return (data).scene
}


function createTractor() {
  const car = new Group();

  const backWheel = createWheels();
  backWheel.position.x = -18;
  car.add(backWheel);

  const frontWheel = createWheels();
  frontWheel.position.x = 18;
  car.add(frontWheel);

  const main = new Mesh(
    new BoxBufferGeometry(60, 20, 30),
    new MeshLambertMaterial({ color: 0x78b14b }),
  );
  main.position.z = 12;
  car.add(main);

  const carFrontTexture = getCarFrontTexture();
  const carBackTexture = getCarFrontTexture();
  const carRightSideTexture = getCarSideTexture();
  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.center = new Vector2(0.5, 0.5);
  carLeftSideTexture.rotation = Math.PI;
  carLeftSideTexture.flipY = false;

  const cabin = new Mesh(
    new BoxBufferGeometry(23, 14, 12),
    [
      new MeshLambertMaterial({ map: carFrontTexture }),
      new MeshLambertMaterial({ map: carBackTexture }),
      new MeshLambertMaterial({ map: carLeftSideTexture }),
      new MeshLambertMaterial({ map: carRightSideTexture }),
      new MeshLambertMaterial({ color: cabinBaseColor }), // top
      new MeshLambertMaterial({ color: cabinBaseColor }), // bottom
    ],
  );
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  return car;
}

export { createCar, createTractor };

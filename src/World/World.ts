/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
import {
  PerspectiveCamera,
  Scene,
  WebGL1Renderer,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cameraWidth, createCamera } from './components/camera';
import { createAxesHelper, createGridHelper } from './components/helpers';
import { createLights } from './components/lights';
import { createCar } from './components/objects/car';
import { createScene } from './components/scene';
import { createControls } from './systems/controls';
import { Loop } from './systems/Loop';
import { createRenderer } from './systems/renderer';
import { Resizer } from './systems/Resizer';
import { createMap } from './components/objects/map';
import {
  arcCenterX,
  buttonsElement, config, instructionsElement, resultsElement, scoreElement, trackRadius,
} from './constants';
import { getDistance, pickRandom } from './utils';

/**
 * If two instances of the World class are created, the second instance will
 * overwrite the module scoped variables below from the first instance.
 * Accordingly, only one World class should be used at a time.
 */
let ready: boolean;

const speed: number = 0.0017;
const playerAngleInitial: number = Math.PI;
let score: number;
let playerAngleMoved: number;
let accelerate: boolean = false; // Is the player accelerating
let decelerate: boolean = false; // Is the player decelerating

let playerCar: any;
let otherVehicles: any[] = [];
let lastTimestamp: number;

function getPlayerSpeed() {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
}

function getVehicleSpeed(type: string) {
  if (type === 'car') {
    const minimumSpeed = 1;
    const maximumSpeed = 2;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
  if (type === 'truck') {
    const minimumSpeed = 0.6;
    const maximumSpeed = 1.5;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
  return 0;
}

function movePlayerCar(timeDelta: number) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;

  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;

  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}

function moveOtherVehicles(timeDelta: number) {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }

    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;
    const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
}

function getHitZonePosition(center: any, angle: any, clockwise: boolean, distance: number) {
  const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
  return {
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance,
  };
}

function hitDetection(renderer: any) {
  const playerHitZone1 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    15,
  );

  const playerHitZone2 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    -15,
  );

  if (config.showHitZones) {
    playerCar.userData.hitZone1.position.x = playerHitZone1.x;
    playerCar.userData.hitZone1.position.y = playerHitZone1.y;

    playerCar.userData.hitZone2.position.x = playerHitZone2.x;
    playerCar.userData.hitZone2.position.y = playerHitZone2.y;
  }

  const hit = otherVehicles.some((vehicle) => {
    if (vehicle.type === 'car') {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        15,
      );

      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -15,
      );

      if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;

        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;
      }

      // The player hits another vehicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;

      // Another vehicle hits the player
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }

    if (vehicle.type === 'truck') {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        35,
      );

      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        0,
      );

      const vehicleHitZone3 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -35,
      );

      if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;

        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;

        vehicle.mesh.userData.hitZone3.position.x = vehicleHitZone3.x;
        vehicle.mesh.userData.hitZone3.position.y = vehicleHitZone3.y;
      }

      // The player hits another vehicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone3) < 40) return true;

      // Another vehicle hits the player
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }
  });

  if (hit) {
    if (resultsElement) resultsElement.style.display = 'flex';
    renderer.setAnimationLoop(null); // Stop animation loop
  }
}

function addVehicle(scene: any) {
  const vehicleTypes = ['car'];

  const type = pickRandom(vehicleTypes);
  const vehicleSpeed = getVehicleSpeed(type);
  const clockwise = Math.random() >= 0.5;

  const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;

  const mesh = type === 'car' ? createCar() : undefined;
  scene.add(mesh);

  otherVehicles.push({
    mesh, type, vehicleSpeed, clockwise, angle,
  });
}

function positionScoreElement() {
  const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
  scoreElement.style.cssText = `
    left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
    top: ${window.innerHeight / 2}px
  `;
}

class World {
  camera: PerspectiveCamera;

  scene: Scene;

  renderer: WebGLRenderer | WebGL1Renderer;

  controls: OrbitControls;

  loop: Loop;

  running: boolean;

  constructor(container: HTMLCanvasElement) {
    this.camera = createCamera();

    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop({ camera: this.camera, scene: this.scene, renderer: this.renderer });
    container.append(this.renderer.domElement);

    const { directionalLight, ambientLight } = createLights();

    this.scene.add(directionalLight, ambientLight);

    const grid = createGridHelper();
    const axes = createAxesHelper();

    this.scene.add(grid, axes);
  }

  async init() {
    playerCar = createCar();
    const map = createMap();
    this.scene.add(playerCar);
    this.scene.add(map);
  }

  // for apps that update occasionally
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  reset() {
    // Reset position and score
    playerAngleMoved = 0;
    score = 0;
    scoreElement.innerText = 'Press UP';

    // Remove other vehicles
    otherVehicles.forEach((vehicle) => {
    // Remove the vehicle from the scene
      this.scene.remove(vehicle.mesh);

      // If it has hit-zone helpers then remove them as well
      if (vehicle.mesh.userData.hitZone1) { this.scene.remove(vehicle.mesh.userData.hitZone1); }
      if (vehicle.mesh.userData.hitZone2) { this.scene.remove(vehicle.mesh.userData.hitZone2); }
      if (vehicle.mesh.userData.hitZone3) { this.scene.remove(vehicle.mesh.userData.hitZone3); }
    });
    otherVehicles = [];

    resultsElement.style.display = 'none';

    lastTimestamp = undefined;

    // Place the player's car to the starting position
    // movePlayerCar(0);

    // Render the scene
    this.render();

    ready = true;
  }

  animation(timestamp: number) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      return;
    }

    const timeDelta = timestamp - lastTimestamp;

    movePlayerCar(timeDelta);

    const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));

    // Update score if it changed
    if (laps !== score) {
      score = laps;
      scoreElement.innerText = score.toString();
    }

    // Add a new vehicle at the beginning and with every 5th lap
    if (otherVehicles.length < (laps + 1) / 5) addVehicle(this.scene);

    moveOtherVehicles(timeDelta);

    hitDetection(this.renderer);

    this.render();
    lastTimestamp = timestamp;
  }

  startGame() {
    if (ready) {
      ready = false;
      scoreElement.innerText = '0';
      buttonsElement.style.opacity = '1';
      instructionsElement.style.opacity = '0';
      this.renderer.setAnimationLoop(this.animation);
    }
  }

  // for apps with constant animation
  start() {
    this.loop.start();
    this.running = true;
    this.reset();
    this.startGame();
  }

  stop() {
    this.loop.stop();
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  startAccelerating() {
    accelerate = true;
  }

  stopAccelerating() {
    accelerate = false;
  }

  startDeacelerating() {
    decelerate = true;
  }

  stopDeacelerating() {
    decelerate = false;
  }
}

export { World };

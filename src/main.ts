import { BoxBufferGeometry, MeshLambertMaterial, OrthographicCamera, Scene, AmbientLight, DirectionalLight, GridHelper, WebGL1Renderer, CanvasTexture } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createMap } from './World/components/objects/map';
import { createCar, createTractor } from './World/components/objects/car';
import { createRock } from './World/components/objects/rock';
document.querySelector('#h1')?.append('Exame CMC-30');

async function main() {

  window.focus();

  function pickRandom(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getDistance(coordinate1: any, coordinate2: any) {
    const xDistance = coordinate2.x - coordinate1.x;
    const yDistance = coordinate2.y - coordinate1.y;
    return Math.sqrt(xDistance ** 2 + yDistance ** 2);
  }

  const vehicleColors = [
    0xa52523,
    0xef2d56,
    0x0ad3ff,
    0xff9f1c
  ];

  const rock = await createRock();

  const wheelGeometry = new BoxBufferGeometry(12, 33, 12);
  const wheelMaterial = new MeshLambertMaterial({ color: 0x333333 });

  const config = {
    showHitZones: false,
    shadows: true,
    trees: true,
    curbs: true,
    grid: false
  };

  let score: any;
  const speed = 0.0017;

  const playerAngleInitial = Math.PI;
  let playerAngleMoved: any;
  let accelerate = false;
  let decelerate = false;

  let otherVehicles: any[] = [];
  let ready: any;
  let lastTimestamp: any;

  const trackRadius = 225;
  const trackWidth = 45;
  const innerTrackRadius = trackRadius - trackWidth;
  const outerTrackRadius = trackRadius + trackWidth;

  const arcAngle1 = (1 / 3) * Math.PI; // 60 degrees

  const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
  const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

  const arcCenterX =
    (Math.cos(arcAngle1) * innerTrackRadius +
      Math.cos(arcAngle2) * outerTrackRadius) /
    2;


  const scoreElement = document.getElementById("score");
  const buttonsElement = document.getElementById("buttons");
  const instructionsElement = document.getElementById("instructions");
  const resultsElement = document.getElementById("results");
  const accelerateButton = document.getElementById("accelerate");
  const decelerateButton = document.getElementById("decelerate");

  setTimeout(() => {
    if (ready) instructionsElement.style.opacity = '1';
    buttonsElement.style.opacity = '1';
  }, 4000);

  // Initialize ThreeJs
  // Set up camera
  const aspectRatio = window.innerWidth / window.innerHeight;
  const cameraWidth = 960;
  const cameraHeight = cameraWidth / aspectRatio;

  const camera = new OrthographicCamera(
    cameraWidth / -2, // left
    cameraWidth / 2, // right
    cameraHeight / 2, // top
    cameraHeight / -2, // bottom
    50, // near plane
    700 // far plane
  );

  camera.position.set(0, -210, 300);
  camera.lookAt(0, 0, 0);

  const scene = new Scene();

  const playerCar = await createCar();
  scene.add(playerCar);

  await renderMap(cameraWidth, cameraHeight * 2); // The map height is higher because we look at the map from an angle

  // Set up lights
  const ambientLight = new AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(100, -300, 300);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.left = -400;
  dirLight.shadow.camera.right = 350;
  dirLight.shadow.camera.top = 400;
  dirLight.shadow.camera.bottom = -300;
  dirLight.shadow.camera.near = 100;
  dirLight.shadow.camera.far = 800;
  scene.add(dirLight);


  if (config.grid) {
    const gridHelper = new GridHelper(80, 8);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);
  }

  const renderer = new WebGL1Renderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (config.shadows) renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  reset();

  function reset() {
    playerAngleMoved = 0;
    score = 0;
    scoreElement.innerText = "Press UP";

    otherVehicles.forEach((vehicle) => {
      scene.remove(vehicle.mesh);

      if (vehicle.mesh.userData.hitZone1)
        scene.remove(vehicle.mesh.userData.hitZone1);
      if (vehicle.mesh.userData.hitZone2)
        scene.remove(vehicle.mesh.userData.hitZone2);
      if (vehicle.mesh.userData.hitZone3)
        scene.remove(vehicle.mesh.userData.hitZone3);
    });
    otherVehicles = [];

    resultsElement.style.display = "none";

    lastTimestamp = undefined;

    movePlayerCar(0);

    renderer.render(scene, camera);

    ready = true;
  }

  function startGame() {
    if (ready) {
      ready = false;
      scoreElement.innerText = '0';
      buttonsElement.style.opacity = '1';
      instructionsElement.style.opacity = '0';
      renderer.setAnimationLoop(animation);
    }
  }

  function positionScoreElement() {
    const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
    scoreElement.style.cssText = `
    left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
    top: ${window.innerHeight / 2}px
  `;
  }

  function getLineMarkings(mapWidth: any, mapHeight: any) {
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext("2d");

    context.fillStyle = '#f2ad68';
    context.fillRect(0, 0, mapWidth, mapHeight);


    return new CanvasTexture(canvas);
  }

  async function renderMap(mapWidth: any, mapHeight: any) {
    const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);

    let fieldMesh = createMap();
    fieldMesh.receiveShadow = true;
    fieldMesh.matrixAutoUpdate = false;
    scene.add(fieldMesh);

    positionScoreElement();

    async function Tree2() {
      const loader = new GLTFLoader();

      const data = await loader.loadAsync('public/assets/models/tree.gltf');

      const treeHeights = [45, 60, 75];
      const height = pickRandom(treeHeights);


      (data).scene.scale.set(8, 8, 8);
      (data).scene.position.z = height / 2 + 30;
      (data).scene.rotateX(Math.PI / 2);
      (data).scene.castShadow = true;
      (data).scene.receiveShadow = true;
      return (data).scene

    }

    if (config.trees) {

      const tree1 = await Tree2();

      tree1.position.x = arcCenterX * 1.3;

      scene.add(tree1);

      const tree2 = await Tree2();
      tree2.position.x = arcCenterX * -1.3;
      scene.add(tree2);

      const tree3 = await Tree2();
      tree3.position.x = arcCenterX * 0.8;
      tree3.position.y = arcCenterX * 2;
      scene.add(tree3);

      const tree4 = await Tree2();
      tree4.position.x = arcCenterX * 1.8;
      tree4.position.y = arcCenterX * 2;
      scene.add(tree4);

      const tree5 = await Tree2();
      tree5.position.x = -arcCenterX * 1;
      tree5.position.y = arcCenterX * 2;
      scene.add(tree5);

      const tree6 = await Tree2();
      tree6.position.x = -arcCenterX * 2;
      tree6.position.y = arcCenterX * 1.8;
      scene.add(tree6);

      const tree7 = await Tree2();
      tree7.position.x = arcCenterX * 0.8;
      tree7.position.y = -arcCenterX * 2;
      scene.add(tree7);

      const tree8 = await Tree2();
      tree8.position.x = arcCenterX * 1.8;
      tree8.position.y = -arcCenterX * 2;
      scene.add(tree8);

      const tree9 = await Tree2();
      tree9.position.x = -arcCenterX * 1;
      tree9.position.y = -arcCenterX * 2;
      scene.add(tree9);

      const tree10 = await Tree2();
      tree10.position.x = -arcCenterX * 2;
      tree10.position.y = -arcCenterX * 1.8;
      scene.add(tree10);

      const tree11 = await Tree2();
      tree11.position.x = arcCenterX * 0.6;
      tree11.position.y = -arcCenterX * 2.3;
      scene.add(tree11);

      const tree12 = await Tree2();
      tree12.position.x = arcCenterX * 1.5;
      tree12.position.y = -arcCenterX * 2.4;
      scene.add(tree12);

      const tree13 = await Tree2();
      tree13.position.x = -arcCenterX * 0.7;
      tree13.position.y = -arcCenterX * 2.4;
      scene.add(tree13);

      const tree14 = await Tree2();
      tree14.position.x = -arcCenterX * 1.5;
      tree14.position.y = -arcCenterX * 1.8;
      scene.add(tree14);
    }
  }

  function getCarFrontTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 64, 32);

    context.fillStyle = "#666666";
    context.fillRect(8, 8, 48, 24);

    return new CanvasTexture(canvas);
  }

  function getCarSideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 32);

    context.fillStyle = "#666666";
    context.fillRect(10, 8, 38, 24);
    context.fillRect(58, 8, 60, 24);

    return new CanvasTexture(canvas);
  }


  function getTruckFrontTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 32);

    context.fillStyle = "#666666";
    context.fillRect(0, 5, 32, 10);

    return new CanvasTexture(canvas);
  }

  function getTruckSideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 32);

    context.fillStyle = "#666666";
    context.fillRect(17, 5, 15, 10);

    return new CanvasTexture(canvas);
  }

  accelerateButton.addEventListener("mousedown", function () {
    startGame();
    accelerate = true;
  });
  decelerateButton.addEventListener("mousedown", function () {
    startGame();
    decelerate = true;
  });
  accelerateButton.addEventListener("mouseup", function () {
    accelerate = false;
  });
  decelerateButton.addEventListener("mouseup", function () {
    decelerate = false;
  });
  window.addEventListener("keydown", function (event) {
    if (event.key == "ArrowUp") {
      startGame();
      accelerate = true;
      return;
    }
    if (event.key == "ArrowDown") {
      decelerate = true;
      return;
    }
    if (event.key == "R" || event.key == "r") {
      reset();
      return;
    }
  });
  window.addEventListener("keyup", function (event) {
    if (event.key == "ArrowUp") {
      accelerate = false;
      return;
    }
    if (event.key == "ArrowDown") {
      decelerate = false;
      return;
    }
  });

  function animation(timestamp: any) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      return;
    }

    const timeDelta = timestamp - lastTimestamp;

    movePlayerCar(timeDelta);

    const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));

    // Update score if it changed
    if (laps != score) {
      score = laps;
      scoreElement.innerText = score;
    }

    // Add a new vehicle at the beginning and with every 5th lap
    if (otherVehicles.length < (laps + 1) / 5) addVehicle();

    moveOtherVehicles(timeDelta);

    hitDetection();

    renderer.render(scene, camera);
    lastTimestamp = timestamp;
  }

  function movePlayerCar(timeDelta: any) {
    const playerSpeed = getPlayerSpeed();
    playerAngleMoved -= playerSpeed * timeDelta;

    const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

    const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
    const playerY = Math.sin(totalPlayerAngle) * trackRadius;

    playerCar.position.x = playerX;
    playerCar.position.y = playerY;

    playerCar.rotation.y = totalPlayerAngle - Math.PI / 2;
  }

  function moveOtherVehicles(timeDelta: any) {
    otherVehicles.forEach((vehicle) => {
      if (vehicle.clockwise) {
        vehicle.angle -= speed * timeDelta * vehicle.speed;
      } else {
        vehicle.angle += speed * timeDelta * vehicle.speed;
      }

      const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
      const vehicleY = Math.sin(vehicle.angle) * trackRadius;
      const rotation =
        vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
      vehicle.mesh.position.x = vehicleX;
      vehicle.mesh.position.y = vehicleY;
      vehicle.mesh.rotation.z = rotation;
    });
  }

  function getPlayerSpeed() {
    if (accelerate) return speed * 2;
    if (decelerate) return speed * 0.5;
    return speed;
  }

  function addVehicle() {
    const vehicleTypes = ["car", "truck"];

    const type = pickRandom(vehicleTypes);
    const speed = getVehicleSpeed(type);
    const clockwise = Math.random() >= 0.5;

    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    const mesh = type == "car" ? createTractor() : rock;
    scene.add(mesh);

    otherVehicles.push({ mesh, type, speed, clockwise, angle });
  }

  function getVehicleSpeed(type: any) {
    if (type == "car") {
      const minimumSpeed = 1;
      const maximumSpeed = 2;
      return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
    }
    if (type == "truck") {
      const minimumSpeed = 0.6;
      const maximumSpeed = 1.5;
      return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
    }
  }

  function getHitZonePosition(center: any, angle: any, clockwise: any, distance: any) {
    const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
    return {
      x: center.x + Math.cos(directionAngle) * distance,
      y: center.y + Math.sin(directionAngle) * distance
    };
  }

  function hitDetection() {
    const playerHitZone1 = getHitZonePosition(
      playerCar.position,
      playerAngleInitial + playerAngleMoved,
      true,
      15
    );

    const playerHitZone2 = getHitZonePosition(
      playerCar.position,
      playerAngleInitial + playerAngleMoved,
      true,
      -15
    );

    if (config.showHitZones) {
      playerCar.userData.hitZone1.position.x = playerHitZone1.x;
      playerCar.userData.hitZone1.position.y = playerHitZone1.y;

      playerCar.userData.hitZone2.position.x = playerHitZone2.x;
      playerCar.userData.hitZone2.position.y = playerHitZone2.y;
    }

    const hit = otherVehicles.some((vehicle) => {
      if (vehicle.type == "car") {
        const vehicleHitZone1 = getHitZonePosition(
          vehicle.mesh.position,
          vehicle.angle,
          vehicle.clockwise,
          15
        );

        const vehicleHitZone2 = getHitZonePosition(
          vehicle.mesh.position,
          vehicle.angle,
          vehicle.clockwise,
          -15
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

      if (vehicle.type == "truck") {
        const vehicleHitZone1 = getHitZonePosition(
          vehicle.mesh.position,
          vehicle.angle,
          vehicle.clockwise,
          35
        );

        const vehicleHitZone2 = getHitZonePosition(
          vehicle.mesh.position,
          vehicle.angle,
          vehicle.clockwise,
          0
        );

        const vehicleHitZone3 = getHitZonePosition(
          vehicle.mesh.position,
          vehicle.angle,
          vehicle.clockwise,
          -35
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
      if (resultsElement) resultsElement.style.display = "flex";
      renderer.setAnimationLoop(null); // Stop animation loop
    }
  }

  window.addEventListener("resize", () => {
    console.log("resize", window.innerWidth, window.innerHeight);

    // Adjust camera
    const newAspectRatio = window.innerWidth / window.innerHeight;
    const adjustedCameraHeight = cameraWidth / newAspectRatio;

    camera.top = adjustedCameraHeight / 2;
    camera.bottom = adjustedCameraHeight / -2;
    camera.updateProjectionMatrix(); // Must be called after change

    positionScoreElement();

    // Reset renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  });

}

main().catch((err) => {
  console.log(err);
});

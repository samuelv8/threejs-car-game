import {
  CanvasTexture, Group, Shape, Mesh, MeshLambertMaterial, PlaneGeometry, ExtrudeGeometry,
} from 'three';
import {
  arcAngle1, arcAngle2, arcAngle3, arcAngle4,
  arcCenterX, innerTrackRadius, outerTrackRadius, trackRadius,
} from '../../constants';

function getBasePlaneTexture(mapWidth: number, mapHeight: number) {
  const canvas = document.createElement('canvas');
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext('2d');

  context.fillStyle = '#f2ad68';
  context.fillRect(0, 0, mapWidth, mapHeight);

  context.lineWidth = 2;
  context.strokeStyle = '#faa755';
  context.setLineDash([10, 14]);

  // Left circle
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2,
  );
  context.stroke();

  // Right circle
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2,
  );
  context.stroke();

  return new CanvasTexture(canvas);
}
function getLeftIsland() {
  const islandLeft = new Shape();

  islandLeft.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle1,
    -arcAngle1,
    false,
  );

  islandLeft.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI + arcAngle2,
    Math.PI - arcAngle2,
    true,
  );

  return islandLeft;
}

function getMiddleIsland() {
  const islandMiddle = new Shape();

  islandMiddle.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle3,
    -arcAngle3,
    true,
  );

  islandMiddle.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI + arcAngle3,
    Math.PI - arcAngle3,
    true,
  );

  return islandMiddle;
}

function getRightIsland() {
  const islandRight = new Shape();

  islandRight.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI - arcAngle1,
    Math.PI + arcAngle1,
    true,
  );

  islandRight.absarc(
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle2,
    arcAngle2,
    false,
  );

  return islandRight;
}

function getOuterField(mapWidth: number, mapHeight: number) {
  const field = new Shape();

  field.moveTo(-mapWidth / 2, -mapHeight / 2);
  field.lineTo(0, -mapHeight / 2);

  field.absarc(
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle4,
    arcAngle4,
    true,
  );

  field.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI - arcAngle4,
    Math.PI + arcAngle4,
    true,
  );

  field.lineTo(0, -mapHeight / 2);
  field.lineTo(mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, mapHeight / 2);

  return field;
}

function createMap() {
  const map = new Group();
  const aspectRatio = window.innerWidth / window.innerHeight;
  const mapWidth = 960;
  const mapHeight = 2 * (mapWidth / aspectRatio);

  const basePlaneTexture = getBasePlaneTexture(mapWidth, mapHeight);
  const basePlaneGeometry = new PlaneGeometry(mapWidth, mapHeight);
  const basePlaneMaterial = new MeshLambertMaterial({ map: basePlaneTexture });
  const basePlane = new Mesh(basePlaneGeometry, basePlaneMaterial);
  map.add(basePlane);

  const islandLeft = getLeftIsland();
  const islandRight = getRightIsland();
  const islandMiddle = getMiddleIsland();
  const outerField = getOuterField(mapWidth, mapHeight);

  const internalFieldGeometry = new ExtrudeGeometry(
    [islandLeft, islandRight, islandMiddle],
    {
      depth: 0, bevelEnabled: true, bevelSize: 5, bevelThickness: 0.1,
    },
  );
  const internalFieldMesh = new Mesh(
    internalFieldGeometry,
    [
      new MeshLambertMaterial({ color: '#e39140' }),
      new MeshLambertMaterial({ color: '#e89b4f' }),
    ],
  );
  map.add(internalFieldMesh);

  const externalFieldGeometry = new ExtrudeGeometry(
    outerField,
    { depth: 10, bevelEnabled: true },
  );
  const externalFieldMesh = new Mesh(externalFieldGeometry, [
    new MeshLambertMaterial({ color: '#e39140' }),
    new MeshLambertMaterial({ color: '#bd7e40' }),
  ]);
  map.add(externalFieldMesh);

  return map;
}

export { createMap };

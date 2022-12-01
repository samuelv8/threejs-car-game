import THREE = require('three');

// HTML elements
export const scoreElement = document.getElementById('score');
export const buttonsElement = document.getElementById('buttons');
export const instructionsElement = document.getElementById('instructions');
export const resultsElement = document.getElementById('results');
export const accelerateButton = document.getElementById('accelerate');
export const decelerateButton = document.getElementById('decelerate');
export const youtubeLogo = document.getElementById('youtube-main');

// Geometry
export const trackRadius = 225;
export const trackWidth = 45;
export const innerTrackRadius = trackRadius - trackWidth;
export const outerTrackRadius = trackRadius + trackWidth;

export const arcAngle1 = (1 / 3) * Math.PI;
const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
export const arcAngle2 = Math.asin(deltaY / outerTrackRadius);
export const arcCenterX = (
  Math.cos(arcAngle1) * innerTrackRadius
  + Math.cos(arcAngle2) * outerTrackRadius
) / 2;
export const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);
export const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

// Configuration
export const config = {
  showHitZones: false,
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
  curbs: true, // Show texture on the extruded geometry
  grid: false, // Show grid helper
};

// Graphics
export const vehicleColors = [
  0xa52523,
  0xef2d56,
  0x0ad3ff,
  0xff9f1c, /* 0xa52523, 0xbdb638, 0x78b14b */
];
export const lawnGreen = '#67C240';
export const trackColor = '#546E90';
export const edgeColor = '#725F48';
export const treeCrownColor = 0x498c2c;
export const treeTrunkColor = 0x4b3f2f;

export const wheelGeometry = new THREE.BoxBufferGeometry(12, 33, 12);
export const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
export const treeTrunkGeometry = new THREE.BoxBufferGeometry(15, 15, 30);
export const treeTrunkMaterial = new THREE.MeshLambertMaterial({
  color: treeTrunkColor,
});
export const treeCrownMaterial = new THREE.MeshLambertMaterial({
  color: treeCrownColor,
});

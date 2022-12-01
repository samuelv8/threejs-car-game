// Pick a random value from an array
export function pickRandom(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

// The Pythagorean theorem says that the distance between two points is
// the square root of the sum of the horizontal and vertical distance's square
export function getDistance(coordinate1: any, coordinate2: any) {
  const horizontalDistance = coordinate2.x - coordinate1.x;
  const verticalDistance = coordinate2.y - coordinate1.y;
  return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

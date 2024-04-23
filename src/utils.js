import * as THREE from "three";

function calculateFigureEightPoints(a, shift, numPoints) {
  let points = [];
  // Loop through and calculate the points for each lobe (2 * pi for a full circle)
  let radius1 = a + shift
  let radius2 = a - shift
  let offset = radius1 + radius2;

  for (let i = 0; i < numPoints; i++) {
    // Parameter t ranges from 0 to 2*PI to loop around the entire figure once
    const t = (i / numPoints) * 2 * Math.PI;
    const denom = 1 + Math.sin(t) ** 2;
    let x, z;
    if (t < Math.PI / 2 || t > Math.PI * 3 / 2) {

      let rotationAngle = t
      x = ((a + shift) * Math.cos(rotationAngle)) / denom;
      z = ((a + shift) * Math.cos(rotationAngle) * Math.sin(rotationAngle)) / denom + shift * Math.sin(rotationAngle);
    } else {
      let rotationAngle = (t)
      x = ((a - shift) * Math.cos(rotationAngle)) / denom;
      z = ((a - shift) * Math.cos(rotationAngle) * Math.sin(rotationAngle)) / denom + shift * Math.sin(rotationAngle);
    }


    const y = 3 * Math.sin(t)
    points.push(new THREE.Vector3(x, 0, z));

  }

  return points;
}
const findClosestPoint = (vectorPoints, cameraPosition) => {
  let closestPoint = null;
  let minDistance = Infinity;

  for (let i = 1; i < vectorPoints.length; i++) {
    const distance = vectorPoints[i].distanceTo(cameraPosition);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = i;
    }
  }

  return closestPoint;
};

// Function to check if a point is within the threshold distance of the camera
const isPointVisible = (point, cameraPosition) => {
  const SHOW_DISTANCE = 1500   //display till 1500 points from camera
  let radius = 50; // radius of each lobe of the eight
  let numPoints = 10000; // number of points to calculate
  let points = calculateFigureEightPoints(radius, 0, numPoints);
  const idx = findClosestPoint(points, point)
  let closestPoint = findClosestPoint(points, cameraPosition);

  if (closestPoint + SHOW_DISTANCE >= points.length) {
    if (idx + points.length < closestPoint + SHOW_DISTANCE && idx > closestPoint) {
      return true
    }
  }
  if (idx < closestPoint + SHOW_DISTANCE && idx > closestPoint) {
    return true;
  }
  return false;
};

export { isPointVisible, findClosestPoint, calculateFigureEightPoints };
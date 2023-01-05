/// refer:
//  1: https://codepen.io/IndependentSw/pen/mLZzGj
//  2: https://math.stackexchange.com/questions/885292/how-to-take-derivative-of-bezier-function

export function getCubicBezierXY(
  t: number,
  sx: number,
  sy: number,
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  ex: number,
  ey: number
) {
  return {
    x: Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
    y: Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey,
  };
}

export function getCubicBezierAngle(
  t: number,
  sx: number,
  sy: number,
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  ex: number,
  ey: number
) {
  const dx = Math.pow(1 - t, 2) * (cp1x - sx) + 2 * t * (1 - t) * (cp2x - cp1x) + t * t * (ex - cp2x);
  const dy = Math.pow(1 - t, 2) * (cp1y - sy) + 2 * t * (1 - t) * (cp2y - cp1y) + t * t * (ey - cp2y);
  return -Math.atan2(dx, dy) + 0.5 * Math.PI;
}

export function getQuadraticBezierXY(
  t: number,
  sx: number,
  sy: number,
  cp1x: number,
  cp1y: number,
  ex: number,
  ey: number
) {
  return {
    x: Math.pow(1 - t, 2) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
    y: Math.pow(1 - t, 2) * sy + 2 * (1 - t) * t * cp1y + t * t * ey,
  };
}

export function getQuadraticAngle(
  t: number,
  sx: number,
  sy: number,
  cp1x: number,
  cp1y: number,
  ex: number,
  ey: number
) {
  const dx = 2 * (1 - t) * (cp1x - sx) + 2 * t * (ex - cp1x);
  const dy = 2 * (1 - t) * (cp1y - sy) + 2 * t * (ey - cp1y);
  return -Math.atan2(dx, dy) + 0.5 * Math.PI;
}

export function getQuadraticStartEndPoint(
  nodeSize: number,
  degree: number,
  sx: number,
  sy: number,
  ex: number,
  ey: number
) {
  const radian = (degree / 180) * Math.PI;

  return {
    sx: sx + nodeSize * Math.cos(radian),
    sy: sy + nodeSize * Math.sin(radian),
    ex: ex + nodeSize * Math.cos(radian) * -1,
    ey: ey + nodeSize * Math.sin(radian),
  };
}

export function getLoopEdgeBezierPoint(nodeSize: number, parallelSeq: number, x: number, y: number) {
  const len = 75 * parallelSeq;

  // x goes from left to right
  // y goes from up to down
  // so we choose start at 270 and end at 180

  const degreeStart = 270 + (parallelSeq - 1) * 5;
  const radianStart = (degreeStart / 180) * Math.PI;
  const degreeEnd = 180 - (parallelSeq - 1) * 5;
  const radianEnd = (degreeEnd / 180) * Math.PI;

  const sx = x + nodeSize * Math.cos(radianStart);
  const sy = y + nodeSize * Math.sin(radianStart);
  const ex = x + nodeSize * Math.cos(radianEnd);
  const ey = y + nodeSize * Math.sin(radianEnd);

  const cp1x = x + (nodeSize + len) * Math.cos(radianStart);
  const cp1y = y + (nodeSize + len) * Math.sin(radianStart);
  const cp2x = x + (nodeSize + len) * Math.cos(radianEnd);
  const cp2y = y + (nodeSize + len) * Math.sin(radianEnd);

  return {
    sx,
    sy,
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    ex,
    ey,
  };
}

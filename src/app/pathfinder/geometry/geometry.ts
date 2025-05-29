export function segmentsIntersect(a, b, c, d) {
  function ccw(p1, p2, p3) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }
  return (ccw(a, c, d) !== ccw(b, c, d)) && (ccw(a, b, c) !== ccw(a, b, d));
}

export function isPathBlocked(a, b, walls, floor) {
  for (const wall of walls) {
    if (wall.floor !== floor) continue;
    if (segmentsIntersect(a, b, { x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 })) {
      return true;
    }
  }
  return false;
}

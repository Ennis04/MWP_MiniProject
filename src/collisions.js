export const collisionBoxes = [];
export const collisionCylinders = [];

export function registerBox(minX, maxX, minZ, maxZ) {
  collisionBoxes.push({ minX, maxX, minZ, maxZ });
}

export function registerCylinder(x, z, radius) {
  collisionCylinders.push({ x, z, radius });
}

export function resolveCustomCollisions(pos, playerRadius = 0.3) {
  // Handle cylinders
  for (const c of collisionCylinders) {
    const dx = pos.x - c.x;
    const dz = pos.z - c.z;
    const dist = Math.hypot(dx, dz);
    const minDist = c.radius + playerRadius;
    if (dist > 0.0001 && dist < minDist) {
      const push = minDist - dist;
      pos.x += (dx / dist) * push;
      pos.z += (dz / dist) * push;
    }
  }

  // Handle axis-aligned bounding boxes
  for (const b of collisionBoxes) {
    // Find the closest point inside the box to the player
    const closestX = Math.max(b.minX, Math.min(pos.x, b.maxX));
    const closestZ = Math.max(b.minZ, Math.min(pos.z, b.maxZ));

    const dx = pos.x - closestX;
    const dz = pos.z - closestZ;
    const dist = Math.hypot(dx, dz);

    if (dist < playerRadius) {
      if (dist === 0) {
        // Player is somehow perfectly inside the box, push them out arbitrarily (rare)
        pos.x += playerRadius;
      } else {
        // Push the player away from the closest edge point
        const push = playerRadius - dist;
        pos.x += (dx / dist) * push;
        pos.z += (dz / dist) * push;
      }
    }
  }
}

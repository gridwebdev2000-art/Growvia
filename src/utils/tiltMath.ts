export interface CardTiltResult {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

export interface CardTiltOptions {
  maxRotateX?: number;
  maxRotateY?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Computes subtle 3D CSS rotation angles (in degrees) and percentage glare coordinates
 * from pointer coordinates relative to a card's bounding box.
 */
export function computeCardTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  options: CardTiltOptions = {}
): CardTiltResult {
  const maxRotateX = options.maxRotateX ?? 3.5;
  const maxRotateY = options.maxRotateY ?? 3.5;

  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };
  }

  // Normalized coordinates in [-1, 1] centered at card midpoint
  const nx = clamp(((clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
  const ny = clamp(((clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);

  // Moving pointer right (+nx) tilts right edge down -> positive rotateY
  // Moving pointer down (+ny) tilts bottom edge down -> negative rotateX
  const rotateY = Number((nx * maxRotateY).toFixed(3));
  const rotateX = Number((-ny * maxRotateX).toFixed(3));

  const glareX = Number((((nx + 1) / 2) * 100).toFixed(2));
  const glareY = Number((((ny + 1) / 2) * 100).toFixed(2));

  return { rotateX, rotateY, glareX, glareY };
}

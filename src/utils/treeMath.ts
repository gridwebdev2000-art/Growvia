export interface LeafNode {
  id: number;
  cx: number;
  cy: number;
  r: number;
  color: '#1F4D33' | '#2E6B45' | '#5E8F63';
  delayMs: number;
}

export interface FruitNode {
  id: number;
  cx: number;
  cy: number;
  r: number;
  delayMs: number;
}

export interface BranchDef {
  id: string;
  d: string;
  strokeWidth: number;
  lengthEstimate: number;
  delayMs: number;
}

export interface ScrollTreeState {
  percentage: number;
  trunkProgress: number;
  branchProgress: number;
  visibleLeafCount: number;
  showFruit: boolean;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export const HERO_BRANCHES: BranchDef[] = [
  { id: 'b1', d: 'M 200 225 Q 170 198 134 185', strokeWidth: 9, lengthEstimate: 85, delayMs: 650 },
  { id: 'b2', d: 'M 200 218 Q 232 190 268 178', strokeWidth: 9, lengthEstimate: 88, delayMs: 740 },
  { id: 'b3', d: 'M 198 192 Q 160 162 122 142', strokeWidth: 7.5, lengthEstimate: 96, delayMs: 830 },
  { id: 'b4', d: 'M 202 184 Q 242 156 278 136', strokeWidth: 7.5, lengthEstimate: 95, delayMs: 920 },
  { id: 'b5', d: 'M 199 162 Q 178 130 156 104', strokeWidth: 6, lengthEstimate: 78, delayMs: 1010 },
  { id: 'b6', d: 'M 201 158 Q 222 126 246 102', strokeWidth: 6, lengthEstimate: 78, delayMs: 1100 },
  { id: 'b7', d: 'M 200 150 Q 200 116 200 88', strokeWidth: 5.5, lengthEstimate: 64, delayMs: 1180 },
  { id: 'b8', d: 'M 158 175 Q 134 166 112 162', strokeWidth: 4.5, lengthEstimate: 50, delayMs: 1240 },
  { id: 'b9', d: 'M 244 168 Q 268 158 290 154', strokeWidth: 4.5, lengthEstimate: 50, delayMs: 1300 },
];

const LEAF_COLORS: ReadonlyArray<LeafNode['color']> = ['#1F4D33', '#2E6B45', '#5E8F63'];

export function generateHeroLeaves(count = 80): LeafNode[] {
  const rand = seededRandom(20261112);
  const raw: Array<{ cx: number; cy: number; r: number; color: LeafNode['color'] }> = [];

  // Cluster anchors inside the canopy crown (centered around x=200, y=132)
  const anchors = [
    { x: 200, y: 126, rx: 88, ry: 68 },
    { x: 145, y: 152, rx: 52, ry: 42 },
    { x: 255, y: 148, rx: 52, ry: 42 },
    { x: 200, y: 84, rx: 54, ry: 34 },
  ];

  for (let i = 0; i < count; i++) {
    const anchor = anchors[i % anchors.length];
    const angle = rand() * Math.PI * 2;
    // Bias distribution gently toward interior + outer fullness
    const dist = Math.sqrt(rand());
    const cx = Math.round((anchor.x + Math.cos(angle) * anchor.rx * dist) * 10) / 10;
    const cy = Math.round((anchor.y + Math.sin(angle) * anchor.ry * dist) * 10) / 10;
    const r = Math.round((11 + rand() * 11) * 10) / 10;
    const color = LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)];
    raw.push({ cx, cy, r, color });
  }

  // Sort from bottom (largest cy) up to top (smallest cy) so leaves pop in bottom-up
  raw.sort((a, b) => b.cy - a.cy);

  const startDelay = 1220;
  const spanMs = 1150;
  return raw.map((leaf, index) => ({
    id: index + 1,
    cx: leaf.cx,
    cy: leaf.cy,
    r: leaf.r,
    color: leaf.color,
    delayMs: Math.round(startDelay + (index / Math.max(1, count - 1)) * spanMs),
  }));
}

export const HERO_FRUITS: FruitNode[] = [
  { id: 1, cx: 144, cy: 158, r: 5.5, delayMs: 2450 },
  { id: 2, cx: 248, cy: 152, r: 5.5, delayMs: 2540 },
  { id: 3, cx: 182, cy: 112, r: 5, delayMs: 2630 },
  { id: 4, cx: 224, cy: 102, r: 5.5, delayMs: 2720 },
  { id: 5, cx: 162, cy: 132, r: 4.5, delayMs: 2810 },
  { id: 6, cx: 266, cy: 130, r: 4.5, delayMs: 2890 },
];

export interface MiniLeafDef {
  id: number;
  cx: number;
  cy: number;
  r: number;
  color: '#1F4D33' | '#2E6B45' | '#5E8F63';
}

// Sorted bottom-up for the mini scroll tree widget
export const MINI_TREE_LEAVES: MiniLeafDef[] = [
  { id: 1, cx: 22, cy: 40, r: 5.5, color: '#1F4D33' },
  { id: 2, cx: 42, cy: 39, r: 5.5, color: '#2E6B45' },
  { id: 3, cx: 32, cy: 38, r: 6, color: '#2E6B45' },
  { id: 4, cx: 17, cy: 34, r: 5, color: '#5E8F63' },
  { id: 5, cx: 47, cy: 34, r: 5, color: '#1F4D33' },
  { id: 6, cx: 28, cy: 31, r: 6.5, color: '#1F4D33' },
  { id: 7, cx: 38, cy: 31, r: 6, color: '#5E8F63' },
  { id: 8, cx: 21, cy: 26, r: 5.5, color: '#2E6B45' },
  { id: 9, cx: 43, cy: 26, r: 5.5, color: '#2E6B45' },
  { id: 10, cx: 32, cy: 24, r: 6.5, color: '#5E8F63' },
  { id: 11, cx: 25, cy: 19, r: 5, color: '#1F4D33' },
  { id: 12, cx: 39, cy: 19, r: 5, color: '#5E8F63' },
  { id: 13, cx: 32, cy: 15, r: 5.5, color: '#2E6B45' },
];

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function computeScrollTreeState(
  rawProgress: number,
  totalLeaves = MINI_TREE_LEAVES.length
): ScrollTreeState {
  const p = clamp01(rawProgress);
  const percentage = Math.round(p * 100);

  // Trunk draws from 0% to 40% scroll
  const trunkProgress = clamp01(p / 0.4);

  // Branches draw from 22% to 55% scroll
  const branchProgress = clamp01((p - 0.22) / 0.33);

  // Leaves appear sequentially bottom-up from 30% to 88% scroll
  const leafWindow = clamp01((p - 0.3) / 0.58);
  const visibleLeafCount = Math.round(leafWindow * totalLeaves);

  // Final orange fruit appears near the end (>= 90% scroll)
  const showFruit = p >= 0.9;

  return {
    percentage,
    trunkProgress,
    branchProgress,
    visibleLeafCount,
    showFruit,
  };
}

export type SeededRng = () => number;

export function createSeededRng(seed: number): SeededRng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeedFromTime(): number {
  const now = Date.now();
  const mix = Math.floor(Math.random() * 1e9);
  return (now ^ mix) >>> 0;
}

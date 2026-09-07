import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reproducible illustrative Gaussian-increment walks. They are decorative
// numerical samples, not theorem figures or plots of the user's research.
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../assets/stochastic');
fs.mkdirSync(out, { recursive: true });
let seed = 70926;
function uniform() { seed = (1664525 * seed + 1013904223) >>> 0; return (seed + 1) / 4294967297; }
function normal() { return Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform()); }
const colors = ['#2f67b7', '#2f67b7', '#3b8891', '#567aa3', '#a35440'];
const walks = Array.from({ length: 11 }, (_, j) => {
  let y = 400;
  const points = [[40, y]];
  for (let i = 1; i <= 150; i++) {
    y += normal() * 9;
    points.push([40 + i * 7.45, y]);
  }
  return { points, color: colors[j % colors.length] };
});
const svg = content => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none">${content}</svg>\n`;
const d = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
fs.writeFileSync(path.join(out, 'stochastic-paths.svg'), svg(walks.map((w, j) => `<path d="${d(w.points)}" stroke="${w.color}" stroke-width="${j === 3 ? 2.8 : 1.5}" stroke-opacity="${j === 3 ? .9 : .52}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')));

const density = [52, 85, 124, 175, 240].map((sigma, j) => {
  const pts = Array.from({ length: 181 }, (_, i) => {
    const x = 40 + i * 6.2;
    return [x, 590 - 17500 / sigma * Math.exp(-((x - 670) ** 2) / (2 * sigma ** 2))];
  });
  return `<path d="${d(pts)}" stroke="${colors[j % colors.length]}" stroke-width="${j === 2 ? 2.6 : 1.5}" stroke-opacity=".7"/>`;
}).join('');
fs.writeFileSync(path.join(out, 'stochastic-density.svg'), svg(`<path d="M72 590H1156M670 182V625" stroke="#809eae" stroke-width="1" stroke-dasharray="3 8"/>${density}`));

const particles = walks.map((w, j) => w.points.filter((_, i) => i > 10 && i % 27 === j % 6).map(([x, y], k) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${k % 4 === 0 ? 4.5 : 2.4}" fill="${w.color}" fill-opacity="${k % 4 === 0 ? .76 : .43}"/>`).join('')).join('');
fs.writeFileSync(path.join(out, 'stochastic-particles.svg'), svg(particles));
console.log('Three deterministic SVG layers written to assets/stochastic. Seed 70926.');

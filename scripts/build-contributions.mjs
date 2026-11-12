#!/usr/bin/env node
/**
 * Regenerate the contribution grid and inline it into index.html.
 *
 * The point of building it here rather than pointing an <img> at one of the
 * public contribution-chart services is that the site promises zero runtime
 * requests to third parties. A remote image would break that, add a render
 * dependency on somebody else's uptime, and hand a tracker every visitor's IP.
 * Fetching at build time and committing static markup keeps all three promises.
 *
 * The grid is emitted as plain <rect> elements carrying CSS classes, not inline
 * fills, so it picks up the site's own palette and follows the light/dark
 * toggle like everything else on the page.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node scripts/build-contributions.mjs
 *
 * Runs in CI daily (see .github/workflows/contributions.yml). Locally, the
 * GitHub CLI's token works: GITHUB_TOKEN=$(gh auth token) node scripts/...
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'Enrique-S-J';
const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, '..', 'index.html');

const START = '<!-- contrib:start -->';
const END = '<!-- contrib:end -->';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is not set. Try: GITHUB_TOKEN=$(gh auth token) node scripts/build-contributions.mjs');
  process.exit(1);
}

const query = `query {
  user(login: "${USER}") {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
  }
}`;

const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': `${USER}-portfolio-build`,
  },
  body: JSON.stringify({ query }),
});

if (!response.ok) {
  console.error(`GitHub API returned ${response.status}. The grid was left as-is.`);
  process.exit(1);
}

const payload = await response.json();
if (payload.errors) {
  console.error('GitHub API errors:', JSON.stringify(payload.errors));
  process.exit(1);
}

const calendar = payload.data.user.contributionsCollection.contributionCalendar;
const weeks = calendar.weeks;
const total = calendar.totalContributions;

// --- Geometry -------------------------------------------------------------
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const TOP = 18; // room for month labels
const width = weeks.length * STEP - GAP;
const height = TOP + 7 * STEP - GAP;

/**
 * One class per intensity level, on fixed thresholds. This is not GitHub's
 * bucketing: the profile calendar shades by quartile of the user's own
 * activity, so its colours are relative where these are absolute.
 */
function level(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const rects = [];
const monthLabels = [];
let lastMonth = -1;

weeks.forEach((week, x) => {
  for (const day of week.contributionDays) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const y = date.getUTCDay();
    const n = day.contributionCount;

    // A month label is placed at the first week that contains that month's 1st-7th.
    const month = date.getUTCMonth();
    if (month !== lastMonth && date.getUTCDate() <= 7) {
      monthLabels.push(`<text class="cg-month" x="${x * STEP}" y="10">${MONTHS[month]}</text>`);
      lastMonth = month;
    }

    rects.push(
      `<rect class="cg-c cg-${level(n)}" x="${x * STEP}" y="${TOP + y * STEP}" width="${CELL}" height="${CELL}" rx="2">` +
        `<title>${n} contribution${n === 1 ? '' : 's'} on ${day.date}</title>` +
        `</rect>`,
    );
  }
});

const firstDay = weeks[0].contributionDays[0].date;
const lastWeek = weeks[weeks.length - 1].contributionDays;
const lastDay = lastWeek[lastWeek.length - 1].date;

const svg = [
  `<svg class="contrib-grid" viewBox="0 0 ${width} ${height}" role="img"`,
  ` aria-label="GitHub contribution grid: ${total} contributions between ${firstDay} and ${lastDay}.">`,
  monthLabels.join(''),
  rects.join(''),
  `</svg>`,
].join('');

const caption =
  `<p class="contrib-caption"><strong>${total}</strong> contribution${total === 1 ? '' : 's'} ` +
  `in the last 12 months &middot; public repositories only &middot; ` +
  `updated ${new Date().toISOString().slice(0, 10)}</p>`;

const block = `${START}\n${svg}\n${caption}\n${END}`;

const html = readFileSync(indexPath, 'utf8');
const startAt = html.indexOf(START);
const endAt = html.indexOf(END);

if (startAt === -1 || endAt === -1) {
  console.error(`Could not find ${START} / ${END} markers in index.html.`);
  process.exit(1);
}

const updated = html.slice(0, startAt) + block + html.slice(endAt + END.length);
writeFileSync(indexPath, updated);

console.log(`Contribution grid rebuilt: ${total} contributions, ${weeks.length} weeks (${firstDay} to ${lastDay}).`);

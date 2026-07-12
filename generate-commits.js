const { execSync } = require('child_process');

const verbs = ["Fix", "Update", "Add", "Refactor", "Remove", "Optimize", "Tweak", "Resolve", "Implement", "Integrate", "Clean up", "Improve"];
const nouns = ["UI", "API route", "database schema", "auth flow", "layout", "dashboard", "carbon tracking", "gamification logic", "badges", "reports", "PDF export", "CSV parsing", "middleware", "types", "linting", "tests", "dependencies", "README", "navigation", "sidebar", "data fetching", "error handling", "performance", "deployment config"];
const contexts = ["for better performance", "to fix a bug", "as requested", "for mobile responsiveness", "to improve UX", "in production", "for the new feature", "to resolve warnings", "for better accessibility", "", "", ""];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateMessage() {
  const verb = verbs[getRandomInt(verbs.length)];
  const noun = nouns[getRandomInt(nouns.length)];
  const context = contexts[getRandomInt(contexts.length)];
  return `${verb} ${noun} ${context}`.trim();
}

function generateDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // add random hours and minutes
  date.setHours(Math.floor(Math.random() * 12) + 8); // 8am to 8pm
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

const numCommits = 112;

for (let i = numCommits; i >= 1; i--) {
  // Map i from numCommits..1 to 30..0 days ago roughly
  const daysAgo = Math.floor((i / numCommits) * 30);
  const dateStr = generateDate(daysAgo);
  const msg = generateMessage();
  
  const cmd = `git commit --allow-empty -m "${msg}" --date="${dateStr}"`;
  try {
    execSync(cmd, { env: { ...process.env, GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr } });
  } catch (e) {
    console.error("Error running commit:", e.message);
  }
}

console.log(`Successfully generated ${numCommits} realistic commits.`);

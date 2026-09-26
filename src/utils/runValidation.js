import { roadmap } from '../data/roadmap.js';
import { phases } from '../data/phases.js';
import { topics } from '../data/topics.js';
import { projects } from '../data/projects.js';
import { careers } from '../data/careers.js';
import { practiceResources } from '../data/practiceResources.js';
import { quotes } from '../data/quotes.js';
import { validateRoadmap } from '../utils/validate.js';

console.log('Running Career Compass data validation...\n');

const result = validateRoadmap(
  roadmap,
  phases,
  topics,
  projects,
  careers,
  practiceResources,
  quotes
);

console.log('--- STATS ---');
console.log(`Phases: ${result.stats.phases}`);
console.log(`Weeks: ${result.stats.weeks}`);
console.log(`Study Days: ${result.stats.studyDays}`);
console.log(`Sunday Rest Days: ${result.stats.sundayRestDays}`);
console.log(`Topics: ${result.stats.topics}`);
console.log(`Subtopics: ${result.stats.subtopics}`);
console.log(`Tasks: ${result.stats.tasks}`);
console.log(`Projects: ${result.stats.projects}`);
console.log(`Milestones: ${result.stats.milestones}`);
console.log(`Careers: ${result.stats.careers}`);
console.log(`Practice Resources: ${result.stats.practiceResources} (${result.stats.verifiedResources} verified)`);
console.log(`Quotes: ${result.stats.quotes}`);

if (result.errors.length > 0) {
  console.error('\n❌ ERRORS:');
  result.errors.forEach(e => console.error(`  - ${e}`));
}

if (result.warnings.length > 0) {
  console.warn('\n⚠️ WARNINGS:');
  result.warnings.forEach(w => console.warn(`  - ${w}`));
}

if (result.valid) {
  console.log('\n✅ ALL VALIDATION CHECKS PASSED!');
  process.exit(0);
} else {
  console.error('\n❌ VALIDATION FAILED!');
  process.exit(1);
}

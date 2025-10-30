// Quick verification script to check all 30 lessons are defined
const { LESSONS } = require('./src/config/lessons.config.js');

console.log('\n=== LESSON CURRICULUM VERIFICATION ===\n');
console.log(`Total lessons defined: ${LESSONS.length}`);
console.log(`Expected: 30\n`);

if (LESSONS.length !== 30) {
  console.error('❌ ERROR: Expected 30 lessons but found', LESSONS.length);
  process.exit(1);
}

// Verify all lesson IDs from 1-30 exist
const expectedIds = Array.from({ length: 30 }, (_, i) => i + 1);
const actualIds = LESSONS.map(l => l.id).sort((a, b) => a - b);

const missingIds = expectedIds.filter(id => !actualIds.includes(id));
if (missingIds.length > 0) {
  console.error('❌ Missing lesson IDs:', missingIds);
  process.exit(1);
}

// Show lessons by phase
console.log('📚 Lessons by Phase:\n');
for (let phase = 1; phase <= 4; phase++) {
  const phaseLessons = LESSONS.filter(l => l.phase === phase);
  console.log(`Phase ${phase}: ${phaseLessons.length} lessons`);
  phaseLessons.forEach(lesson => {
    console.log(`  ✓ Lesson ${lesson.id}: ${lesson.title}`);
  });
  console.log('');
}

console.log('✅ All 30 lessons verified successfully!\n');
console.log('To view in app: Navigate to the "Curriculum" tab (school icon) at the bottom\n');

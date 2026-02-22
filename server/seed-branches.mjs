/**
 * Seed script: tag resources with militaryBranches data
 * Run: node server/seed-branches.mjs
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Branch-specific resource name patterns → branch tags
const branchPatterns = [
  // Army
  { pattern: /army emergency relief|AER|army|fort (hood|bragg|campbell|benning|lewis|bliss|drum|wainwright|irwin|riley|sill|stewart|polk|leonard|huachuca|rucker|eustis|jackson|knox|meade|myer|hamilton)/i, branches: ['army'] },
  // Navy
  { pattern: /navy.marine corps relief|NMCRS|navy|naval|fleet/i, branches: ['navy'] },
  // Marines
  { pattern: /marine|USMC|semper/i, branches: ['marines'] },
  // Air Force
  { pattern: /air force|USAF|airman|airmen|air base/i, branches: ['air-force'] },
  // Coast Guard
  { pattern: /coast guard|USCG/i, branches: ['coast-guard'] },
  // Space Force
  { pattern: /space force|USSF/i, branches: ['space-force'] },
  // National Guard
  { pattern: /national guard|guard/i, branches: ['national-guard'] },
  // Reserves
  { pattern: /reserve|USAR|USNR|USMCR|USAFR|USCGR/i, branches: ['reserves'] },
  // TRICARE - active duty and retirees all branches
  { pattern: /tricare/i, branches: ['army', 'navy', 'air-force', 'marines', 'coast-guard', 'space-force'] },
];

// All-branches resources (VA, federal, general veteran orgs)
const allBranchesPatterns = [
  /^VA |veterans affairs|GI Bill|DAV|American Legion|VFW|AMVETS|Hire Heroes|Operation Homefront|Feeding America|Veterans Crisis|Make the Connection|Give an Hour|NVLSP|National Veterans|HUD.VASH|SSVF|Vocational Rehab|American Job|TRICARE/i
];

// Fetch all resources
const [rows] = await connection.execute('SELECT id, name FROM resources');
console.log(`Processing ${rows.length} resources...`);

let updated = 0;
for (const row of rows) {
  let branches = [];

  // Check if it's an all-branches resource
  const isAllBranches = allBranchesPatterns.some(p => p.test(row.name));
  if (isAllBranches) {
    branches = ['all'];
  } else {
    // Check branch-specific patterns
    for (const { pattern, branches: b } of branchPatterns) {
      if (pattern.test(row.name)) {
        branches = [...new Set([...branches, ...b])];
      }
    }
    // Default: if no specific branch matched, mark as all branches
    if (branches.length === 0) {
      branches = ['all'];
    }
  }

  await connection.execute(
    'UPDATE resources SET militaryBranches = ? WHERE id = ?',
    [JSON.stringify(branches), row.id]
  );
  updated++;
}

console.log(`✅ Updated ${updated} resources with militaryBranches data`);

// Show a sample
const [sample] = await connection.execute(
  'SELECT name, militaryBranches FROM resources WHERE militaryBranches != \'["all"]\' LIMIT 10'
);
console.log('\nBranch-specific resources sample:');
for (const r of sample) {
  console.log(`  ${r.name}: ${r.militaryBranches}`);
}

await connection.end();
process.exit(0);

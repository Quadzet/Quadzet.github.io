#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const FILTER = args.find(arg => !arg.startsWith('--')) || null;

async function findTestFiles(dir) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        files.push(...await findTestFiles(fullPath));
      } else if (entry.name.endsWith('.test.js')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Warning: Could not read directory ${dir}:`, err.message);
    }
  }

  return files;
}

async function runSuite(suite, filePath) {
  const results = { passed: 0, failed: 0, errors: [] };

  console.log(`\n${suite.name}`);

  for (const testCase of suite.tests) {
    try {
      await testCase.fn();
      results.passed++;

      if (VERBOSE) {
        console.log(`  [OK] ${testCase.name}`);
      }
    } catch (err) {
      results.failed++;
      console.log(`  [FAIL] ${testCase.name}`);

      // Show error message (indent for readability)
      const errorMsg = err.message.split('\n').map(line => `    ${line}`).join('\n');
      console.log(errorMsg);

      results.errors.push({
        suite: suite.name,
        test: testCase.name,
        error: err,
        file: filePath
      });
    }
  }

  return results;
}

async function main() {
  console.log('TankSim Test Runner\n');
  console.log('='.repeat(60));

  const startTime = Date.now();

  // Discover test files
  const unitTestDir = join(__dirname, 'unit');
  let testFiles = await findTestFiles(unitTestDir);

  // Apply filter if specified
  if (FILTER) {
    testFiles = testFiles.filter(file => file.includes(FILTER));
    console.log(`Filter: "${FILTER}"`);
  }

  if (testFiles.length === 0) {
    console.log('\n No test files found');
    if (FILTER) {
      console.log(`    (with filter: "${FILTER}")`);
    } else {
      console.log(`    (searched in: ${unitTestDir})`);
    }
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test file(s)`);

  // Execute all test files
  const globalResults = { passed: 0, failed: 0, errors: [] };

  for (const testFile of testFiles) {
    try {
      const module = await import(testFile);

      if (!module.tests) {
        console.log(`\n  ${testFile}`);
        console.log(`   No 'tests' export found (should export { tests })`);
        continue;
      }

      const results = await runSuite(module.tests, testFile);
      globalResults.passed += results.passed;
      globalResults.failed += results.failed;
      globalResults.errors.push(...results.errors);

    } catch (err) {
      console.error(`\n Failed to load test file: ${testFile}`);
      console.error(`   ${err.message}`);
      if (VERBOSE) {
        console.error(err.stack);
      }
      globalResults.failed++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Total:   ${globalResults.passed + globalResults.failed} tests`);
  console.log(`  Passed:  ${globalResults.passed} ✓`);
  console.log(`  Failed:  ${globalResults.failed} ✗`);
  console.log(`  Time:    ${duration}s`);

  if (globalResults.failed > 0) {
    console.log('\nTest suite failed');
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

// Run with error handling
main().catch(err => {
  console.error('\n Fatal error in test runner:');
  console.error(err);
  process.exit(1);
});

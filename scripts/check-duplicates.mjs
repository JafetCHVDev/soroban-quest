#!/usr/bin/env node

/**
 * Check for duplicate .js/.ts files in src/ directory
 * Fails CI if a .js and .ts file with the same basename exist
 */

import { readdir } from 'fs/promises';
import { join, extname, basename } from 'path';

const SRC_DIR = 'src';

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);
    if (file.isDirectory()) {
      await getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Check for .js/.ts duplicates
 */
async function checkDuplicates() {
  const files = await getAllFiles(SRC_DIR);
  
  // Group files by base name (without extension)
  const fileGroups = new Map();
  
  for (const file of files) {
    const ext = extname(file);
    if (ext !== '.js' && ext !== '.ts' && ext !== '.jsx' && ext !== '.tsx') {
      continue;
    }
    
    const base = file.slice(0, -ext.length);
    if (!fileGroups.has(base)) {
      fileGroups.set(base, []);
    }
    fileGroups.get(base).push(file);
  }
  
  // Find duplicates
  const duplicates = [];
  for (const [base, files] of fileGroups) {
    // Check if we have both .js and .ts (or .jsx and .tsx)
    const extensions = files.map(f => extname(f));
    const hasJs = extensions.includes('.js') || extensions.includes('.jsx');
    const hasTs = extensions.includes('.ts') || extensions.includes('.tsx');
    
    if (hasJs && hasTs) {
      duplicates.push({
        base: basename(base),
        files: files.map(f => f.replace(/\\/g, '/')),
      });
    }
  }
  
  if (duplicates.length > 0) {
    console.error('❌ Found duplicate .js/.ts file pairs:\n');
    for (const { base, files } of duplicates) {
      console.error(`  ${base}:`);
      files.forEach(f => console.error(`    - ${f}`));
      console.error('');
    }
    console.error('Please remove one of the files in each pair.\n');
    process.exit(1);
  }
  
  console.log('✅ No duplicate .js/.ts file pairs found');
}

checkDuplicates().catch(err => {
  console.error('Error checking duplicates:', err);
  process.exit(1);
});

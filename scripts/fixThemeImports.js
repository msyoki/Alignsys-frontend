#!/usr/bin/env node

/**
 * Fix Missing THEME_COLORS Imports
 * 
 * This script will:
 * 1. Find all files using THEME_COLORS
 * 2. Add missing imports from correct location (constants/themeColors)
 * 3. Fix incorrect imports from Auth/configs
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

function getRelativePath(filePath) {
  return path.relative(process.cwd(), filePath);
}

function getImportPath(filePath) {
  // Determine correct import path based on file location
  const relPath = getRelativePath(filePath).replace(/\\/g, '/');
  
  if (relPath.startsWith('src/pages/')) {
    return '../constants/themeColors';
  } else if (relPath.startsWith('src/components/')) {
    // Count how many directories deep
    const depth = (relPath.match(/\//g) || []).length - 1;
    return '../'.repeat(depth) + 'constants/themeColors';
  }
  
  return '../constants/themeColors';
}

function hasThemeColorsImport(content) {
  return /import\s+.*THEME_COLORS.*from/.test(content);
}

function hasThemeColorsUsage(content) {
  return /THEME_COLORS\s*\./m.test(content);
}

function removeWrongImport(content) {
  // Remove incorrect import from Auth/configs
  return content.replace(
    /import\s+{\s*THEME_COLORS\s*}\s+from\s+['"][^'"]*Auth\/configs['"];\n?/g,
    ''
  );
}

function addCorrectImport(content, filePath) {
  const importPath = getImportPath(filePath);
  const importStatement = `import { THEME_COLORS } from '${importPath}';\n`;
  
  // Find the last import statement
  const lastImportMatch = content.match(/import\s+(?:.*?)from\s+['"][^'"]+['"];?/g);
  
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const lastImportIndex = content.indexOf(lastImport);
    const insertPoint = lastImportIndex + lastImport.length + 1;
    
    return content.slice(0, insertPoint) + importStatement + content.slice(insertPoint);
  }
  
  // If no imports found, add at the beginning
  return importStatement + '\n' + content;
}

function fixThemeColorsImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!hasThemeColorsUsage(content)) {
      return null; // File doesn't use THEME_COLORS
    }
    
    let changed = false;
    
    // Remove wrong import if present
    if (content.includes('from \'../Auth/configs\'') || content.includes('from "../Auth/configs"')) {
      content = removeWrongImport(content);
      changed = true;
    }
    
    // Add correct import if missing
    if (!hasThemeColorsImport(content)) {
      content = addCorrectImport(content, filePath);
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    log('red', `❌ Error processing ${getRelativePath(filePath)}: ${error.message}`);
    return null;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'build', '.git', '.next'].includes(file)) {
        const result = walkDir(filePath, callback);
        fixed += result.fixed;
        skipped += result.skipped;
        errors += result.errors;
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const result = callback(filePath);
      if (result === true) fixed++;
      else if (result === false) skipped++;
      else if (result === null) errors++;
    }
  }
  
  return { fixed, skipped, errors };
}

// Main execution
async function main() {
  log('cyan', '🔧 Fixing THEME_COLORS imports...\n');

  const srcDir = path.join(__dirname, '../src');
  
  if (!fs.existsSync(srcDir)) {
    log('red', '❌ src/ directory not found!');
    process.exit(1);
  }

  log('cyan', `📂 Processing files in: ${srcDir}\n`);

  let stats = { fixed: 0, skipped: 0, errors: 0 };
  try {
    stats = walkDir(srcDir, fixThemeColorsImports);
  } catch (error) {
    log('red', `\n❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  log('cyan', `\n✨ Import fix complete!`);
  log('green', `✅ Fixed: ${stats.fixed} files`);
  log('yellow', `⏭️  Skipped: ${stats.skipped} files (no THEME_COLORS usage)`);
  if (stats.errors > 0) {
    log('red', `❌ Errors: ${stats.errors} files`);
  }
  
  log('yellow', '\n📝 Summary:');
  log('yellow', '- All THEME_COLORS imports now point to: constants/themeColors');
  log('yellow', '- Removed incorrect imports from: Auth/configs');
  log('yellow', '- Added missing imports where needed');
}

main();

#!/usr/bin/env node

/**
 * Auto-replace #2757aa with THEME_COLORS.primary
 * 
 * Usage: node scripts/replaceColors.js
 * 
 * This script will:
 * 1. Find all .js and .jsx files in src/
 * 2. Replace '#2757aa' with THEME_COLORS.primary
 * 3. Add the import statement automatically
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

function addImportIfNeeded(content, filePath) {
  // Check if already imported
  if (content.includes('THEME_COLORS')) {
    return content;
  }

  // Check if it's in components or pages to adjust path
  const isComponent = filePath.includes('\\components\\');
  const isPage = filePath.includes('\\pages\\');
  const isViewr = filePath.includes('\\Viewer\\');
  
  let importPath = '../constants/themeColors';
  
  if (isComponent && !isViewr) {
    importPath = '../../constants/themeColors';
  } else if (isViewr) {
    importPath = '../../../constants/themeColors';
  }

  // Find the last import statement
  const lastImportMatch = content.match(/import\s+(?:.*?)from\s+['"][^'"]+['"];?/g);
  
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPoint = lastImportIndex + lastImport.length + 1;
    
    const importStatement = `import THEME_COLORS from '${importPath}';\n`;
    return content.slice(0, insertPoint) + importStatement + content.slice(insertPoint);
  }
  
  // If no imports found, add at the beginning
  return `import THEME_COLORS from '${importPath}';\n\n${content}`;
}

function replaceColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changed = false;

    // Replace various forms of the color
    const patterns = [
      { pattern: /color:\s*['"]#2757aa['"]/g, replacement: "color: THEME_COLORS.primary" },
      { pattern: /backgroundColor:\s*['"]#2757aa['"]/g, replacement: "backgroundColor: THEME_COLORS.primary" },
      { pattern: /background:\s*['"]#2757aa['"]/g, replacement: "background: THEME_COLORS.primary" },
      { pattern: /borderColor:\s*['"]#2757aa['"]/g, replacement: "borderColor: THEME_COLORS.primary" },
      { pattern: /border:\s*['"]1px solid\s*#2757aa['"]/g, replacement: "border: `1px solid ${THEME_COLORS.primary}`" },
    ];

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }

    if (changed) {
      content = addImportIfNeeded(content, filePath);
      fs.writeFileSync(filePath, content);
      log('green', `✅ Updated: ${getRelativePath(filePath)}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    log('red', `❌ Error processing ${getRelativePath(filePath)}: ${error.message}`);
    return -1;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'build', '.git', '.next'].includes(file)) {
        count += walkDir(filePath, callback);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const result = callback(filePath);
      if (result === 1) count++;
    }
  }
  
  return count;
}

// Main execution
async function main() {
  log('cyan', '🚀 Starting color replacement...\n');

  const srcDir = path.join(__dirname, '../src');
  
  if (!fs.existsSync(srcDir)) {
    log('red', '❌ src/ directory not found!');
    process.exit(1);
  }

  log('cyan', `📂 Processing files in: ${srcDir}\n`);

  let updated = 0;
  try {
    updated = walkDir(srcDir, replaceColorsInFile);
  } catch (error) {
    log('red', `\n❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  log('cyan', `\n✨ Color replacement complete!`);
  log('green', `📊 ${updated} files updated`);
  log('yellow', '\n📝 Next steps:');
  log('yellow', '1. Review the changes in your files');
  log('yellow', '2. Make sure theme-variables.css is imported in src/App.js');
  log('yellow', '3. Test that all colors are displaying correctly');
  log('yellow', '\n💡 To change the primary color, edit: src/config/theme.config.js');
}

main();

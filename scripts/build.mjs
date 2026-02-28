/**
 * Unified build script for DAK Agency Website + Blog
 * 
 * 1. Builds the main Vite/React site → dist/
 * 2. Builds the Astro blog → blog/dist/
 * 3. Copies blog/dist/ contents into dist/blog/
 * 
 * Result: A single dist/ folder with everything
 */

import { execSync } from 'child_process';
import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const blogDir = resolve(rootDir, 'blog');
const distDir = resolve(rootDir, 'dist');
const blogDistDir = resolve(blogDir, 'dist');

function run(cmd, cwd) {
    console.log(`\n▶ ${cmd}`);
    console.log(`  cwd: ${cwd}\n`);
    execSync(cmd, { cwd, stdio: 'inherit' });
}

// ── Step 1: Build main site ──
console.log('═══════════════════════════════════════════');
console.log('  STEP 1: Building main site (Vite)');
console.log('═══════════════════════════════════════════');
run('npm run build:main', rootDir);

// ── Step 2: Install blog dependencies & build ──
console.log('\n═══════════════════════════════════════════');
console.log('  STEP 2: Building blog (Astro)');
console.log('═══════════════════════════════════════════');
run('npm install', blogDir);
run('npx astro build', blogDir);

// ── Step 3: Merge blog dist into main dist ──
console.log('\n═══════════════════════════════════════════');
console.log('  STEP 3: Merging blog into dist/');
console.log('═══════════════════════════════════════════');

if (!existsSync(blogDistDir)) {
    console.error('ERROR: blog/dist/ not found. Blog build may have failed.');
    process.exit(1);
}

// Create dist/blog/ if it doesn't exist
const targetBlogDir = resolve(distDir, 'blog');
if (!existsSync(targetBlogDir)) {
    mkdirSync(targetBlogDir, { recursive: true });
}

// Copy blog dist contents into dist/blog/
// With base: '/blog', Astro outputs to blog/dist/blog/
const astroBlogOutput = resolve(blogDistDir, 'blog');
if (existsSync(astroBlogOutput)) {
    cpSync(astroBlogOutput, targetBlogDir, { recursive: true });
    console.log(`  ✓ Copied blog/dist/blog/ → dist/blog/`);
} else {
    // Fallback: copy everything from blog/dist/
    cpSync(blogDistDir, targetBlogDir, { recursive: true });
    console.log(`  ✓ Copied blog/dist/ → dist/blog/`);
}

// Also copy _astro assets from blog if they exist
const astroAssetsDir = resolve(blogDistDir, '_astro');
const targetAstroDir = resolve(distDir, '_astro');
if (existsSync(astroAssetsDir)) {
    if (!existsSync(targetAstroDir)) {
        mkdirSync(targetAstroDir, { recursive: true });
    }
    cpSync(astroAssetsDir, targetAstroDir, { recursive: true });
    console.log(`  ✓ Copied blog _astro assets → dist/_astro/`);
}

console.log('\n═══════════════════════════════════════════');
console.log('  ✅ BUILD COMPLETE!');
console.log('═══════════════════════════════════════════');
console.log(`  Main site: dist/`);
console.log(`  Blog:      dist/blog/`);
console.log('');

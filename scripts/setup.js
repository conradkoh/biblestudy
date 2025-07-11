#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execSync, spawnSync } = require('node:child_process');

const backendEnvPath = path.join(__dirname, '..', 'services', 'backend', '.env.local');
const wordForWordEnvPath = path.join(__dirname, '..', 'apps', 'word-for-word', '.env.local');

/**
 * Run Convex init command to initialize the backend without starting dev server
 */
function initConvexDirect() {
  console.log('⚙️  Initializing Convex backend...');
  console.log('This will prompt you to log in to Convex and create a new project if needed.');

  try {
    // Run updated one-time convex setup command
    const result = spawnSync('npx', ['convex', 'dev', '--once'], {
      cwd: path.join(__dirname, '..', 'services', 'backend'),
      stdio: 'inherit',
    });

    if (result.status === 0) {
      console.log('✅ Backend initialization completed successfully.');
      return true;
    }
    console.error('❌ Backend initialization failed.');
    return false;
  } catch (error) {
    console.error('❌ Error initializing Convex backend:', error.message);
    return false;
  }
}

/**
 * Extract CONVEX_URL from .env.local in the backend directory
 */
function getConvexUrl() {
  if (!fs.existsSync(backendEnvPath)) {
    console.error('❌ Error: Backend .env.local file not found.');
    console.error('Please run the initialization command in the services/backend directory first.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  const match = envContent.match(/CONVEX_URL=(.+)/);

  if (!match || !match[1]) {
    console.error('❌ Error: CONVEX_URL not found in the backend .env.local file.');
    process.exit(1);
  }

  return match[1].trim();
}

/**
 * Create or update the word-for-word app's .env.local file with the EXPO_PUBLIC_CONVEX_URL
 */
function setupWordForWordEnv(convexUrl) {
  // Create the word-for-word app directory if it doesn't exist
  const wordForWordEnvDir = path.dirname(wordForWordEnvPath);
  if (!fs.existsSync(wordForWordEnvDir)) {
    fs.mkdirSync(wordForWordEnvDir, { recursive: true });
  }

  let envContent = '';

  // If the word-for-word .env.local already exists, read its content
  if (fs.existsSync(wordForWordEnvPath)) {
    envContent = fs.readFileSync(wordForWordEnvPath, 'utf8');

    // Update or add the EXPO_PUBLIC_CONVEX_URL
    if (envContent.includes('EXPO_PUBLIC_CONVEX_URL=')) {
      envContent = envContent.replace(
        /EXPO_PUBLIC_CONVEX_URL=.+/,
        `EXPO_PUBLIC_CONVEX_URL=${convexUrl}`
      );
    } else {
      envContent += `\nEXPO_PUBLIC_CONVEX_URL=${convexUrl}\n`;
    }
  } else {
    // Create a new .env.local file with just the CONVEX_URL
    envContent = `EXPO_PUBLIC_CONVEX_URL=${convexUrl}\n`;
  }

  // Write the content to the word-for-word .env.local file
  fs.writeFileSync(wordForWordEnvPath, envContent);
}

// Main function to run the setup
function setup() {
  console.log('🚀 Starting Bible Study project setup...');

  // Check if backend .env.local already exists
  if (!fs.existsSync(backendEnvPath)) {
    // Run one-time initialization
    const success = initConvexDirect();
    if (!success) {
      console.error('Could not initialize Convex. Please try running the setup manually.');
      process.exit(1);
    }
  } else {
    console.log('✅ Backend .env.local already exists.');
  }

  // Get the CONVEX_URL from the backend .env.local
  console.log('📄 Extracting CONVEX_URL from backend .env.local...');
  const convexUrl = getConvexUrl();
  console.log(`✅ Found CONVEX_URL: ${convexUrl}`);

  // Set up the word-for-word app .env.local file
  console.log('📄 Setting up word-for-word app .env.local file...');
  setupWordForWordEnv(convexUrl);
  console.log('✅ Word-for-word app .env.local file created/updated successfully.');

  console.log('\n🎉 Setup completed successfully!');
  console.log('You can now run the following commands to start development:');
  console.log('  cd apps/word-for-word');
  console.log('  yarn ios     # For iOS development');
  console.log('  yarn android # For Android development');
}

// Run the setup function
setup();

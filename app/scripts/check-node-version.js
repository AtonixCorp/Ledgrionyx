const major = Number.parseInt(process.versions.node.split('.')[0], 10);

if (Number.isNaN(major) || major < 18 || major >= 22) {
  console.error('Unsupported Node.js version for the app dev server.');
  console.error(`Detected Node.js ${process.versions.node}.`);
  console.error('Use Node.js 18, 20, or 21 for this React app.');
  console.error('Recommended: nvm use 20');
  process.exit(1);
}
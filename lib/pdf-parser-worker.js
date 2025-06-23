// This is a simple Node.js script that runs outside of Next.js bundling
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Get output file path from command line argument
const outputFile = process.argv[2];

// Suppress all console output
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
console.log = () => {};
console.warn = () => {};
console.error = () => {};

// Read the PDF buffer from stdin
let chunks = [];
process.stdin.on('data', (chunk) => {
  chunks.push(chunk);
});

process.stdin.on('end', async () => {
  let result;
  try {
    const buffer = Buffer.concat(chunks);
    const data = await pdf(buffer);
    
    result = {
      success: true,
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    result = {
      success: false,
      error: error.message
    };
  }
  
  // Write result to file
  fs.writeFileSync(outputFile, JSON.stringify(result));
  
  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}); 
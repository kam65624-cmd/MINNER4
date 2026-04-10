const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const files = [
    'a784a61709b0b544bd101d48884d318e.data',
    'b7cfc881bfd42a78a34e059c96be3c12.wasm',
    '3dd916af06751e3ff7a2e5465f923ab9.framework.js'
];

const buildDir = path.join(__dirname, 'Build');

files.forEach(file => {
    const input = path.join(buildDir, file + '.br');
    const output = path.join(buildDir, file);
    
    if (fs.existsSync(input)) {
        console.log(`Decompressing ${file}...`);
        try {
            const compressedData = fs.readFileSync(input);
            const decompressedData = zlib.brotliDecompressSync(compressedData);
            fs.writeFileSync(output, decompressedData);
            console.log(`Successfully decompressed ${file}`);
        } catch (err) {
            console.error(`Failed to decompress ${file}:`, err.message);
        }
    } else {
        console.error(`File not found: ${input}`);
    }
});

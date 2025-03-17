import fs from 'fs';
import path from 'path';

const date = new Date();
const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const logsDir = path.join(process.cwd(), 'logs');
const logPath = path.join(logsDir, `test.${dateStr}.log`);

console.log('Starting log test...');
console.log('Log path:', logPath);

// Ensure directory exists
if (!fs.existsSync(logsDir)) {
    console.log('Creating logs directory:', logsDir);
    fs.mkdirSync(logsDir, { recursive: true });
}

// Test synchronous write
try {
    const message = `[${new Date().toISOString()}] TEST - Sync write test\n`;
    fs.writeFileSync(logPath, message, { flag: 'a' });
    console.log('Sync write successful');
} catch (error) {
    console.error('Sync write failed:', error);
}

// Test stream write
const stream = fs.createWriteStream(logPath, { flags: 'a' });

stream.on('error', (error) => {
    console.error('Stream error:', error);
});

stream.on('open', () => {
    console.log('Stream opened');
    const message = `[${new Date().toISOString()}] TEST - Stream write test\n`;

    stream.write(message, (error) => {
        if (error) {
            console.error('Stream write error:', error);
        } else {
            console.log('Stream write successful');
        }

        stream.end(() => {
            console.log('Stream closed');
        });
    });
});

const { exec } = require('child_process');
const fs = require('fs');

exec('npx vite build', (error, stdout, stderr) => {
    fs.writeFileSync('build_out.txt', stdout || '');
    fs.writeFileSync('build_err.txt', stderr || '');
    if (error) {
        fs.writeFileSync('build_status.txt', error.toString());
    } else {
        fs.writeFileSync('build_status.txt', 'success');
    }
});

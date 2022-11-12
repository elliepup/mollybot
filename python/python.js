const { spawn } = require('child_process');

function runPython() {
    const childPython = spawn('python', ['./python/python/test.py', "hello"])

    childPython.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    
    childPython.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
    
    childPython.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

runPython()
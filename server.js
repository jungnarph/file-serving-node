const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const server = http.createServer((req,res)=> {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err,content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File not found</h1>', 'utf8');
            } else {
                res.writeHead(500);
                res.end(`Server error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
            res.end(content, 'utf8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on ${PORT}`));
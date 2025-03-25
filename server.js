const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
        const form = new formidable.IncomingForm();
        form.uploadDir = UPLOAD_DIR;
        form.keepExtensions = true;
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('File upload error');
            }

            if (!files.file) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('No file uploaded');
            }

            const file = files.file[0];

            if (!file.originalFilename) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('Invalid file upload');
            }

            const fileExt = path.extname(file.originalFilename);
            const allowedExtensions = ['.jpg', '.png', '.txt', '.pdf'];

            if (!allowedExtensions.includes(fileExt)) {
                fs.unlinkSync(file.filepath);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('Invalid file type');
            }

            const newFilePath = path.join(UPLOAD_DIR, file.originalFilename);
            fs.renameSync(file.filepath, newFilePath);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>File uploaded successfully!</h1><a href="/">Go Back</a>`);
        });

    } else if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf8');
            }
        });

    } else {
        let filePath = path.join(__dirname, 'public', req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File not found</h1>', 'utf8');
            } else {
                res.writeHead(200, { 'Content-Type': mime.lookup(filePath) || 'application/octet-stream' });
                res.end(content, 'utf8');
            }
        });
    }
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

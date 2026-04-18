const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Dukung data besar

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }

app.use('/uploads', express.static(uploadDir));
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // Batas upload 100MB
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.get('/api/videos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.json([]);
        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        res.json(videoFiles.sort((a, b) => b.split(' - ')[1] - a.split(' - ')[1])); // Video terbaru di atas
    });
});

app.post('/upload', upload.single('video'), (req, res) => {
    const PASSWORD_ADMIN = "wahyuningsih"; 
    const videoTitle = req.body.title || "Untitled";

    if (req.body.password !== PASSWORD_ADMIN) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).send("<h1>Password Salah!</h1><a href='/'>Kembali</a>");
    }
    
    if (!req.file) return res.send('Pilih video dulu!');

    const cleanTitle = videoTitle.replace(/[/\\?%*:|"<>]/g, '-');
    const targetPath = path.join(uploadDir, `${cleanTitle} - ${Date.now()}.mp4`);

    fs.rename(req.file.path, targetPath, err => {
        if (err) return res.send("Gagal simpan file.");
        res.send('<h2>Upload Berhasil!</h2><a href="/">Kembali</a>');
    });
});

app.post('/delete-video', (req, res) => {
    const { filename, password } = req.body;
    if (password !== "wahyuningsih") return res.status(403).json({ success: false });
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => { console.log('Server berjalan di port ' + PORT); });
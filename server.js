const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '500mb' })); 
app.use(express.urlencoded({ extended: true, limit: '500mb' })); 

// Gunakan path absolut agar folder tersimpan di lokasi yang benar di server Hostinger
const uploadDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) { 
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

app.use('/uploads', express.static(uploadDir));

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 500 * 1024 * 1024 }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.get('/api/videos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err || !files) return res.json([]);
        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        res.json(videoFiles.sort((a, b) => b.split(' - ')[1] - a.split(' - ')[1]));
    });
});

app.post('/upload', upload.single('video'), (req, res) => {
    const PASSWORD_ADMIN = "wahyuningsih"; 
    if (req.body.password !== PASSWORD_ADMIN) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).send("<h1>Password Salah!</h1>");
    }
    
    if (!req.file) return res.send('File tidak masuk!');

    const videoTitle = req.body.title || "Untitled";
    const cleanTitle = videoTitle.replace(/[/\\?%*:|"<>]/g, '-');
    const targetPath = path.join(uploadDir, `${cleanTitle} - ${Date.now()}.mp4`);

    fs.rename(req.file.path, targetPath, err => {
        if (err) return res.send("Gagal pindah file.");
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
app.listen(PORT, '0.0.0.0', () => { console.log('Server running...'); });
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); // Supaya bisa baca data JSON
app.use(express.urlencoded({ extended: true })); 

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }

app.use('/uploads', express.static(uploadDir));
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.get('/api/videos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.json([]);
        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        res.json(videoFiles);
    });
});

app.post('/upload', upload.single('video'), (req, res) => {
    const PASSWORD_ADMIN = "wahyuningsih"; 
    if (req.body.password !== PASSWORD_ADMIN) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).send("<h1>Password Salah!</h1><a href='/'>Kembali</a>");
    }
    if (!req.file) return res.send('Pilih video dulu!');
    const targetPath = path.join(uploadDir, Date.now() + ".mp4");
    fs.rename(req.file.path, targetPath, err => {
        if (err) return res.send("Gagal simpan.");
        res.send('<h2>Upload Berhasil!</h2><a href="/">Kembali</a>');
    });
});

// --- FITUR HAPUS VIDEO ---
app.post('/delete-video', (req, res) => {
    const { filename, password } = req.body;
    const PASSWORD_ADMIN = "wahyuningsih";

    if (password !== PASSWORD_ADMIN) {
        return res.status(403).json({ success: false, message: "Password salah!" });
    }

    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "File tidak ditemukan" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => { console.log('Server Jalan di Port ' + PORT); });
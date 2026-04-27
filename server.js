const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const AdmZip = require('adm-zip');
const path = require('path');

const app = express();
app.use(cors({ origin: '*' })); // Allows GitHub Pages access

const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // 16-letter App Password
    }
});

app.post('/send-email', upload.any(), async (req, res) => {
    try {
        const student = req.body.studentName || 'Student';
        const zip = new AdmZip();

        // 1. Pack every file received from the form into the ZIP
        req.files.forEach(file => {
            // The file.fieldname is the specific ID from the frontend (e.g., "Aadhar_Card")
            const ext = path.extname(file.originalname) || '.png';
            zip.addFile(`${file.fieldname}${ext}`, file.buffer);
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'makkaliloruvanfoundation@gmail.com', // Official foundation email [cite: 56, 139]
            subject: `MOF Application Bundle: ${student}`,
            text: `Attached is the complete application bundle for ${student} as a single ZIP file.`,
            attachments: [{
                filename: `${student.replace(/\s+/g, '_')}_MOF_Documents.zip`,
                content: zip.toBuffer()
            }]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Success');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Active on Port ${PORT}`));

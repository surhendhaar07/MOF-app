const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const AdmZip = require('adm-zip');
const path = require('path');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

// --- GMAIL CONFIG ---
const EMAIL_USER = 'makkaliloruvanfoundation@gmail.com'; 
const EMAIL_PASS = 'jvuqaqqqyfwuwngm'; // Get this from Google Security settings

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

app.post('/send-email', upload.any(), async (req, res) => {
    try {
        const name = req.body.studentName || 'Applicant';
        const zip = new AdmZip();

        // 1. Pack every file into the ZIP
        req.files.forEach((f) => {
            // Use the field name from the frontend as the filename inside the ZIP
            const ext = path.extname(f.originalname) || '.png';
            const zipName = `${f.fieldname}${ext}`;
            zip.addFile(zipName, f.buffer);
        });

        const zipBuffer = zip.toBuffer();

        const mailOptions = {
            from: EMAIL_USER,
            to: 'makkaliloruvanfoundation@gmail.com', // Recipient [cite: 56]
            subject: `ZIP Application: ${name}`,
            text: `Attached is a single ZIP file containing the Application PDF and all supporting documents for ${name}.`,
            attachments: [{
                filename: `${name.replace(/\s+/g, '_')}_Bundle.zip`,
                content: zipBuffer
            }]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('ZIP sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Backend error');
    }
});

app.listen(3000, () => console.log(`Server: http://localhost:3000`));
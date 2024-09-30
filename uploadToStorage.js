require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync('./secrets/serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'advizr-890e4.appspot.com'
  });
}

const bucket = admin.storage().bucket();

async function uploadDir(dirPath, destPath = '') {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      await uploadDir(filePath, path.join(destPath, file));
    } else {
      await bucket.upload(filePath, {
        destination: path.join(destPath, file),
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      console.log(`Uploaded: ${filePath} to ${path.join(destPath, file)}`);
    }
  }
}

async function uploadAssets() {
  try {
    await uploadDir('./public/assets');
    console.log('All assets uploaded successfully');
  } catch (error) {
    console.error('Error uploading assets:', error);
  }
}

uploadAssets();
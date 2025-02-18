const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const os = require('os');

const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const bucketName = process.env.GCS_BUCKET_NAME;

const storage = new Storage({ keyFilename });
const bucket = storage.bucket(bucketName);

async function downloadWatchlist(uid) {
  const file = bucket.file(`users/${uid}/watchlist.json`);
  const [exists] = await file.exists();
  if (!exists) {
    return [];
  }

  const filePath = path.join(os.tmpdir(), `${uid}-watchlist.json`);
  await file.download({ destination: filePath });
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  fs.unlinkSync(filePath);
  return data;
}

async function uploadWatchlist(uid, data) {
  const filePath = path.join(os.tmpdir(), `${uid}-watchlist.json`);
  fs.writeFileSync(filePath, JSON.stringify(data));
  await bucket.upload(filePath, { destination: `users/${uid}/watchlist.json` });
  fs.unlinkSync(filePath);
}

module.exports = {
  downloadWatchlist,
  uploadWatchlist,
};

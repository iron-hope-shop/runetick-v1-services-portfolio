const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const os = require('os');

const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const bucketName = process.env.GCS_BUCKET_NAME;

const storage = new Storage({ keyFilename });
const bucket = storage.bucket(bucketName);

async function downloadFile(uid, fileName) {
  try {
    const file = bucket.file(`users/${uid}/${fileName}`);
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const filePath = path.join(os.tmpdir(), `${uid}-${fileName}`);
    await file.download({ destination: filePath });

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (jsonError) {
      if (jsonError.code === 'ENOENT') {
        console.error('File does not exist:', filePath);
      } else {
        console.error('Error parsing JSON:', jsonError);
      }
      return null;
    } finally {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        if (unlinkError.code === 'ENOENT') {
          console.error('File already deleted or does not exist:', filePath);
        } else {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}

async function uploadFile(uid, fileName, data) {
  const filePath = path.join(os.tmpdir(), `${uid}-${fileName}`);
  try {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data));
      await bucket.upload(filePath, { destination: `users/${uid}/${fileName}` });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        if (unlinkError.code !== 'ENOENT') {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
    }
  } catch (outerError) {
    console.error('Unexpected error:', outerError);
  }
}

async function getUserSettings(uid) {
  return await downloadFile(uid, 'settings.json');
}

async function getUserLogs(uid) {
  return await downloadFile(uid, 'logs.json') || [];
}

async function getUserWatchlist(uid) {
  return await downloadFile(uid, 'watchlist.json') || [];
}

async function downloadBetaFile(fileName) {
  try {
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    if (!exists) {
      return [];
    }

    const filePath = path.join(os.tmpdir(), fileName);
    await file.download({ destination: filePath });

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return [];
    } finally {
      fs.unlinkSync(filePath);
    }

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return [];
  }
}

async function uploadBetaFile(fileName, data) {
  const filePath = path.join(os.tmpdir(), fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    await bucket.upload(filePath, { destination: fileName });
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

async function addUserToBetaList(uid) {
  const fileName = 'beta_users.json';
  const users = await downloadBetaFile(fileName);
  if (!users.includes(uid)) {
    users.push(uid);
    await uploadBetaFile(fileName, users);
  }
}

module.exports = {
  getUserSettings,
  getUserLogs,
  getUserWatchlist,
  downloadFile,
  uploadFile,
  uploadBetaFile,
  downloadBetaFile,
  addUserToBetaList,
};
import { Storage } from '@google-cloud/storage';

class GoogleCloudStorageService {
  constructor() {
    this.options = {
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_APP_CREDENTIALS
    };
    this.bucketName = process.env.GCS_BUCKET;
  }

  getStorage() {
    if (this.storage) return this.storage;
    this.storage = new Storage(this.options);
    return this.storage;
  }

  getBucket() {
    if (this.bucket) return this.bucket;
    const storage = this.getStorage();
    this.bucket = storage.bucket(this.bucketName);
    return this.bucket;
  }

  async getFile(folder, filename) {
    const bucket = await this.getBucket();
    const [{ name }] = bucket
      .file(`${folder}/${filename}`)
      .getMetadata();
    return `https://storage.googleapis.com/${this.bucketName}/${name}`;
  }

  async saveFile(destination, filename) {
    const fileArray = filename.split('/');
    const lengthOfFileArray = fileArray.length;
    const file = fileArray[lengthOfFileArray - 1];
    const bucket = await this.getBucket();
    await bucket.upload(filename, {
      destination: `${destination}/${file}`,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    return file;
  }

  async deleteFile(folder, filename) {
    const bucket = await this.getBucket();
    await bucket
      .file(`${folder}/${filename}`)
      .delete();
    return true;
  }
}

export default GoogleCloudStorageService;

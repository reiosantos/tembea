import Utils from '../utils';

class CloudStorageEngine {
  constructor(storage) {
    this.storage = storage;
  }

  async getFile(folder, filename) {
    const file = await this.storage.getFile(folder, filename);
    return file;
  }

  async saveFile(url, cloudFolder, localFolder = './temp') {
    const filename = await Utils.convertToImageAndSaveToLocal(url, localFolder);
    const saved = await this.storage.saveFile(cloudFolder, filename);
    await Utils.removeFile(filename);
    return saved;
  }

  async deleteFile(folder, filename) {
    const deleted = await this.storage.deleteFile(folder, filename);
    return deleted;
  }
}

export default CloudStorageEngine;

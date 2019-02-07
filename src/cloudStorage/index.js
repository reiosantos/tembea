import CloudStorageEngine from './cloudStorageEngine';
import GoogleCloudStorageService from './googleCloudStorage';

const cloudStorageEngine = new GoogleCloudStorageService();

const storage = new CloudStorageEngine(cloudStorageEngine);
export default storage;

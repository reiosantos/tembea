import { Storage } from '@google-cloud/storage';
import GoogleCloudStorageService from '../googleCloudStorage';
import { MockStorage } from '../__mocks__/googleCloudStorageMock';


jest.mock('@google-cloud/storage');

Storage.mockImplementation(options => new MockStorage(options));

describe('GoogleCloudStorage', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getFile', () => {
    let storage;
    it('should get file from google cloud', async (done) => {
      const expectedUrl = 'https://storage.googleapis.com/undefined/test';
      jest.spyOn(GoogleCloudStorageService.prototype, 'getFile').mockResolvedValue(expectedUrl);
      storage = new GoogleCloudStorageService();
      const result = await storage.getFile('uploded', './files/images.jpeg');

      expect(result).toBe(expectedUrl);
      done();
    });
  });

  describe('saveFile', () => {
    let storage;
    it('should save file to google cloud', async (done) => {
      storage = new GoogleCloudStorageService();
      const result = await storage.saveFile('uploded', './files/images.jpeg');

      expect(result).toBeTruthy();
      done();
    });
  });

  describe('deleteFile', () => {
    let storage;
    it('should delete file from google cloud', async (done) => {
      storage = new GoogleCloudStorageService();
      const result = await storage.deleteFile('uploded', './files/images.jpeg');

      expect(result).toBeTruthy();
      done();
    });
  });
});

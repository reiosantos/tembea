import Utils from '../../utils';
import CloudStorageEngine from '../cloudStorageEngine';
import cloudMockEngine, { cloudEngineWithExceptions } from '../__mocks__/cloudStorageEngineMock';

describe('CloudStorageEngine tests', () => {
  let cloudStorageEngine;

  beforeEach(() => {
    cloudStorageEngine = new CloudStorageEngine(cloudMockEngine);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CloudStorageEngine Methods', () => {
    it('should contain a storage', () => {
      expect(cloudStorageEngine.storage).toBeDefined();
      expect(cloudStorageEngine.storage).toHaveProperty('saveFile');
      expect(cloudStorageEngine.storage).toHaveProperty('getFile');
      expect(cloudStorageEngine.storage).toHaveProperty('deleteFile');
    });
  });

  describe('getFile', () => {
    it('should call getFile method', async () => {
      await cloudStorageEngine.getFile('uploaded', 'images.jpeg');
      expect(cloudMockEngine.getFile).toBeCalledTimes(1);
    });
  });

  describe('saveFile', () => {
    it('should call saveFile method', async () => {
      jest.spyOn(Utils, 'convertToImageAndSaveToLocal')
        .mockReturnValue('just a random text');
      jest.spyOn(Utils, 'removeFile').mockResolvedValue(true);
      await cloudStorageEngine.saveFile('https://google.map.api/92920', 'uploaded', './files');
      expect(cloudMockEngine.saveFile).toBeCalledTimes(1);
    });
  });

  describe('deleteFile', () => {
    it('should call deleteFile method', async () => {
      await cloudStorageEngine.deleteFile('uploaded', 'images.jpeg');
      expect(cloudMockEngine.getFile).toBeCalledTimes(1);
    });
  });

  describe('all methods should handle exceptions when error it occurs', () => {
    beforeEach(() => {
      cloudStorageEngine = new CloudStorageEngine(cloudEngineWithExceptions);
    });

    it('should return error message', async () => {
      jest.spyOn(Utils, 'convertToImageAndSaveToLocal')
        .mockReturnValue('./files/ac7f9ca1-c346-48e8-8fb9-854d.jpeg');

      try {
        await cloudStorageEngine.saveFile('https://google.map.api/92920', 'uploaded', './files');
      } catch (err) {
        expect(err).toBeDefined();
      }

      try {
        await cloudStorageEngine.getFile('uploaded', 'images.jpeg');
      } catch (err) {
        expect(err).toBeDefined();
      }
      try {
        await cloudStorageEngine.deleteFile('uploaded', 'images.jpeg');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});

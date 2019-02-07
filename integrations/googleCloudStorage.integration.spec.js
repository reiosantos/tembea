import storage from '../src/cloudStorage';

const data = {
  url: 'https://logo.clearbit.com/andela.com',
  cloudFolder: 'uploaded',
  localFolder: './files'
};
describe.skip('GoogleCloudStorage', () => {
  describe('saveFile Mehtod', () => {
    it('should save file to Google Cloud Storage', async (done) => {
      const result = await storage.saveFile(data.url, data.cloudFolder, data.localFolder);
      expect(result).toBeTruthy();
      done();
    });

    it('should throw an error', async (done) => {
      const result = await storage.saveFile('', data.cloudFolder, data.localFolder);
      expect(result).toBeFalsy();
      done();
    });
  });
});

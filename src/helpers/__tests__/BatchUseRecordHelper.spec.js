import BatchUseRecordService from '../../services/BatchUseRecordService';
import BatchUseRecordHelper from '../BatchUseRecordHelper';
import { data, route, recordData } from '../__mocks__/BatchUseRecordMock';

describe('BatchUseRecordHelper', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('BatchUseRecordHelper.serializePaginatedData', () => {
    it('BatchUseRecordHelper.serializePaginatedData', () => {
      const paginatedData = { data: [{ data, route }], pageMeta: {} };
      
      jest.spyOn(BatchUseRecordService, 'serializeBatchRecord')
        .mockImplementation(() => recordData);
      const serializedData = BatchUseRecordHelper.serializePaginatedData(paginatedData);
      expect(serializedData).toEqual({ data: [recordData], pageMeta: {} });
    });
  });
});

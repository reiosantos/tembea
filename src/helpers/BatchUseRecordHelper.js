import BatchUseRecordService from '../services/BatchUseRecordService';

class BatchUseRecordHelper {
  static serializePaginatedData(paginatedData) {
    const newData = Object.assign({}, paginatedData);
    const { data, pageMeta } = newData;
    const result = data.map(BatchUseRecordService.serializeBatchRecord);
    newData.data = result;
    newData.pageMeta = pageMeta;
    return newData;
  }
}
export default BatchUseRecordHelper;

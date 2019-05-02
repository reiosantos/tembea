const batchRecords = [[{
  BatchUseRecordID: 1,
  userAttendStatus: 'NotConfirmed',
  RouteRecordID: 1,
  RouteBatchID: 1002,
  RouteBatchName: 'A',
  Route: 'Rowe Center',
  RouteID: 1008,
  batchUseDate: '2019-05-07'
},
{
  BatchUseRecordID: 2,
  userAttendStatus: 'NotConfirmed',
  RouteRecordID: 1,
  RouteBatchID: 1002,
  RouteBatchName: 'B',
  Route: 'Rowe Center',
  RouteID: 1008,
  batchUseDate: '2019-05-07'
},
]];
const successMessage = 'Percentage Usage Generated';
const returnedObject = {
  mostUsedBatch: {
    emptyRecord: {
      Route: 'N/A',
      RouteBatch: '',
      percentageUsage: 0,
      users: 0
    }
  },
  leastUsedBatch: {
    emptyRecord: {
      Route: 'N/A',
      RouteBatch: '',
      percentageUsage: 0,
      users: 0
    }
  },
  dormantRouteBatches: []
};
const percentages = [];
export {
  batchRecords, successMessage, returnedObject, percentages
};

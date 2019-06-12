const payload = {
  driverName: 'Muhwezi Deo2',
  driverNumber: 'UB5422424344',
  driverPhoneNo: '0705331111',
  providerId: 1
};

const drivers = {
  data: [
    {
      id: 1,
      driverName: 'Muhwezi Deo2',
      driverNumber: 'UB5422424344',
      driverPhoneNo: '0705331111',
      providerId: 1,
      deletedAt: null
    },
  ],
  pageMeta: {
    totalPages: 1, pageNo: 1, totalItems: 5, itemsPerPage: 100
  }

};

const paginatedData = {
  pageMeta: {
    totalPages: 1,
    page: 1,
    totalResults: 26,
    pageSize: 100
  },
  drivers
};

const overloadPayload = {
  driverName: 'Muhwezi Deo2',
  driverNumber: 'UB5422424344',
  model: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    + 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s,'
    + 'when an unknown printer took a galley of type and scrambled it to make a type'
    + 'specimen book. It has survived not',
};

const returnedData = {
  data: [
    {
      id: 1,
      driverName: 'Muhwezi Deo2',
      driverNumber: 'UB5422424344',
      driverPhoneNo: '0705331111',
      providerId: 1,
      deletedAt: null
    },
  ],
  pageMeta: {
    totalPages: 1, pageNo: 1, totalItems: 5, itemsPerPage: 100
  }
};


const successMessage = '1 of 1 page(s).';
const payloadData = {
  payload,
  overloadPayload,
  drivers,
  paginatedData,
  successMessage,
  returnedData
};

export default payloadData;

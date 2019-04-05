const payload = {
  driverName: 'Cassidy Eze',
  driverPhoneNo: '+254 639 003 893',
  regNumber: 'KCA 545',
  capacity: '1',
  model: 'Limo',
  location: 'Kampala'
};

const overloadPayload = {
  driverName: 'Ian Leakey',
  driverPhoneNo: '07757736238',
  regNumber: 'KCA 453',
  capacity: '5',
  model: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    + 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s,'
    + 'when an unknown printer took a galley of type and scrambled it to make a type'
    + 'specimen book. It has survived not',
  location: 'Kampala'
};
const updateData = {
  driverName: 'Deo Muhwezi'
};

const payloadData = {
  payload, overloadPayload, updateData
};

export default payloadData;

import DriverHelper from '../DriverHelper';


describe('ManagerActionsHelper', () => {
  const driverMock = {
    driverName: 'ade',
    driverPhoneNo: '94840383038',
    driverNumber: '909000',
  };
  const driversMock = [
    driverMock
  ];

  it('it should convert an array of driver details into driver label', (done) => {
    const valuePairsData = DriverHelper.createDriverLabel(driversMock);
    const expectedData = [
      {
        label: `${driverMock.driverName.toUpperCase()} - ${driverMock.driverNumber}`,
        value: [driverMock.driverName, driverMock.driverPhoneNo, driverMock.driverNumber].toString()
      }
    ];
    expect(valuePairsData).toEqual(expectedData);
    done();
  });
});

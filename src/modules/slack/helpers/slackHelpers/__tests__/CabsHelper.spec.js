import CabsHelper from '../CabsHelper';


describe('ManagerActionsHelper', () => {
  const cabMock = {
    id: 1,
    model: 'subaru',
    regNumber: 'FHD - 484',
    capacity: 8,
    driverName: 'ade',
    driverPhoneNo: '94840383038',
  };
  const cabsMock = [
    cabMock
  ];

  it('it should generate a label for a cab', (done) => {
    const labelFormat = CabsHelper.generateCabLabel(cabMock);
    const expectedFormat = `${cabMock.model.toUpperCase()} - ${cabMock.regNumber} - Seats up to ${cabMock.capacity} people`;
    expect(labelFormat).toEqual(expectedFormat);
    done();
  });

  it('it should convert an array of cab details into cab lable value pairs', (done) => {
    const valuePairsData = CabsHelper.toCabLabelValuePairs(cabsMock);
    const expectedData = [
      {
        label: `${cabMock.model.toUpperCase()} - ${cabMock.regNumber} - Seats up to ${cabMock.capacity} people`,
        value: cabMock.id
      }
    ];
    expect(valuePairsData).toEqual(expectedData);
    done();
  });

  it('it should convert an array of cab details into cab text value pairs', (done) => {
    const valuePairsData = CabsHelper.toCabLabelValuePairs(cabsMock, true);
    const expectedData = [
      {
        text: `${cabMock.model.toUpperCase()} - ${cabMock.regNumber} - Seats up to ${cabMock.capacity} people`,
        value: cabMock.id
      }
    ];
    expect(valuePairsData).toEqual(expectedData);
    done();
  });
});

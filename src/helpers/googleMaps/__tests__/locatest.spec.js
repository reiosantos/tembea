import LocationHelpers from '../locationsMapHelpers';

describe('locationPrompt', () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  const locationData = {
    address: 'Nairobi', latitude: '1234567', longitude: '34567890'
  };
  const payload = {
    user: {
      id: '1'
    }
  };
  
  it('should call locationPrompt', () => {
    LocationHelpers.locationPrompt = jest.fn().mockResolvedValue({});
    LocationHelpers.sendResponse('pickupBtn', locationData, respond, payload);
    expect(LocationHelpers.locationPrompt).toBeCalled();
  
    LocationHelpers.sendResponse('destinationBtn', locationData, respond, payload);
    expect(LocationHelpers.locationPrompt).toBeCalled();
  });
});

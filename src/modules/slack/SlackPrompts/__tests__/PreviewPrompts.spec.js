import { PreviewPrompts } from '../../RouteManagement/rootFile';
import { SlackAttachment } from '../../SlackModels/SlackMessageModels';
import Cache from '../../../../cache';

describe('RouteInputHandlerHelper', () => {
  const data = {
    staticMapUrl: 'https://staticImageUrl',
    homeToDropOffDistance: { distanceInMetres: 1330 },
    dojoToDropOffDistance: { distanceInMetres: 2330 },
    savedBusStop: {
      address: 'address'
    },
    savedHomeAddress: {
      address: 'home'
    },
  };
  const addFieldActionsSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
  const addOptionalProps = jest.spyOn(SlackAttachment.prototype, 'addOptionalProps');
  const result = ['12/01/2019', '12/12/2022', 'Safaricom'];
  jest.spyOn(Cache, 'fetch').mockResolvedValue(result);
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sendPartnerInfoPreview', async () => {
    const payload = {
      submission: {
        manager: 'manager',
        nameOfPartner: 'partner',
        workingHours: '16:00 - 23:00'
      }
    };
    const previewData = { ...data };
    await PreviewPrompts.sendPartnerInfoPreview(payload, previewData, 'fellow');
    expect(addFieldActionsSpy).toBeCalledTimes(2);
    expect(addOptionalProps).toBeCalledTimes(1);
  });

  it('displayDestinationPreview', () => {
    PreviewPrompts.displayDestinationPreview({ ...data });
    expect(addFieldActionsSpy).toBeCalledTimes(3);
    expect(addOptionalProps).toBeCalledTimes(2);
  });
});

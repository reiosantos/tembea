import OpsDialogPrompts from '../OpsDialogPrompts';
import DialogPrompts from '../DialogPrompts';

describe('OpsDialogPrompts', () => {
  beforeEach(() => {
    jest.spyOn(DialogPrompts, 'sendDialog').mockResolvedValue();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  const payloadMock = {
    actions: [{ selected_options: [{ value: 'value_id' }] }],
    message_ts: '',
    channel: { id: 'channel' }
  };
  it('should send a dialog prompt', async () => {
    await OpsDialogPrompts.sendOpsSelectCabDialog(payloadMock);
    expect(DialogPrompts.sendDialog).toBeCalledTimes(1);
  });
});

import sinon from 'sinon';
import models from '../../../../../database/models';
import TripRescheduleHelper from '../rescheduleHelper';
import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';

describe('Trip Reschedule Helper test', () => {
  const { TripRequest } = models;

  it('should send Reschedule Trip Form ', async (done) => {
    const tripRequestFindByPkStub = sinon.stub(TripRequest, 'findByPk');
    const sendRescheduleTripFormSpy = sinon.spy(DialogPrompts, 'sendRescheduleTripForm');

    const now = Date.now();
    const oneHourAfter = new Date(now + 2 * 60 * 60 * 1000);
    tripRequestFindByPkStub.resolves({
      confirmedById: 0,
      departureTime: `${oneHourAfter.toISOString()}`
    });
    const payload = {};
    const response = jest.fn();
    await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);
    expect(sendRescheduleTripFormSpy.calledOnce)
      .toEqual(true);

    tripRequestFindByPkStub.restore();
    sendRescheduleTripFormSpy.restore();
    done();
  });

  it('should send Reschedule Confirm Error', async () => {
    const tripRequestFindByPkStub = sinon.stub(TripRequest, 'findByPk');
    const spy = sinon.spy(InteractivePrompts, 'rescheduleConfirmedError');

    const now = Date.now();
    const oneHourAfter = new Date(now - 60 * 60 * 1000);

    tripRequestFindByPkStub.resolves({
      confirmedById: 1,
      departureTime: `${oneHourAfter.toISOString()}`
    });

    const payload = {};
    const response = jest.fn();
    await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);
    expect(spy.calledOnce)
      .toEqual(true);

    tripRequestFindByPkStub.restore();
    spy.restore();
  });

  it('should handle unexpected errors', async () => {
    const tripRequestFindByPkStub = sinon.stub(TripRequest, 'findByPk');
    const spy = sinon.spy(InteractivePrompts, 'sendTripError');

    tripRequestFindByPkStub.rejects();
    const payload = {};
    const response = jest.fn();
    await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);
    expect(spy.calledOnce)
      .toEqual(true);

    tripRequestFindByPkStub.restore();
    spy.restore();
  });
});

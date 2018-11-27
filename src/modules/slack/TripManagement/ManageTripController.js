import validator from 'validator';
import models from '../../../database/models';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DataHelper from '../../../helpers/dataHelpers';
import SlackEvents from '../events';
import { slackEventNames } from '../events/slackEvents';

const { TripRequest, Address, User } = models;

class ManageTripController {
  static runValidation(declineReason) {
    const errors = [];
    if (declineReason.trim() === '') {
      errors.push(new SlackDialogError('declineReason',
        'This field cannot be empty'));
    }
    if (declineReason.trim().length > 100) {
      errors.push(new SlackDialogError('declineReason',
        'Character length must be less than or equal to 100'));
    }
    return errors;
  }

  static async declineTrip(state, declineReason, respond) {
    // eslint-disable-next-line no-useless-escape
    const reason = validator.blacklist(declineReason.trim(), '=\'\"\t\b\0\Z').trim();

    const scheduledTrip = await TripRequest.findByPk(state[2], {
      where: {
        tripStatus: 'Pending'
      },
      include: [
        { model: Address, as: 'origin' },
        { model: Address, as: 'destination' },
        { model: User, as: 'requester' }]
    }).then(async (trip) => {
      const head = await DataHelper.getHeadByDepartmentId(trip.departmentId);
      const ride = trip;
      ride.tripStatus = 'DeclinedByManager';
      ride.managerComment = reason;
      ride.declinedById = head.id;
      ride.save();

      InteractivePrompts.sendDeclineCompletion(trip.dataValues, state[0], state[1]);
      SlackEvents.raise(slackEventNames.DECLINED_TRIP_REQUEST, ride.dataValues, respond);
    }).catch(() => {
      respond({
        text: 'Dang, something went wrong there.'
      });
    });

    return scheduledTrip;
  }
}

export default ManageTripController;

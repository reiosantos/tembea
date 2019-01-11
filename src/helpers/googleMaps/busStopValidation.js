import { SlackDialogError } from '../../modules/slack/SlackModels/SlackDialogModels';
import googleMapsHelpers from './index';

const validateBusStop = (otherBusStop, selectBusStop) => {
  if (!otherBusStop && !selectBusStop) {
    const error = new SlackDialogError('otherBusStop',
      'One of the fields must be filled.');

    return { errors: [error] };
  }
  if (otherBusStop && selectBusStop) {
    const error = new SlackDialogError('otherBusStop',
      'You can not fill in this field if you selected a stop in the drop down');

    return { errors: [error] };
  }
  const busStop = selectBusStop || otherBusStop;

  if (!googleMapsHelpers.isCoordinate(busStop)) {
    return {
      errors: [
        new SlackDialogError('otherBusStop', 'You must submit a valid coordinate')
      ]
    };
  }
};

export default validateBusStop;

import Cache from '../../../../../cache';
import Utils from '../../../../../utils';
import { getTravelKey } from './index';


export default async (payload, dateTimeType = 'flightDateTime') => {
  const { user: { id } } = payload;
  const {
    departmentId, departmentName, contactDetails, tripType
  } = await Cache.fetch(getTravelKey(id));
  return {
    rider: contactDetails.rider,
    departmentId,
    departmentName,
    tripType,
    ...contactDetails,
    reason: 'Airport Transfer',
    ...payload.submission,
    dateTime: Utils.removeHoursFromDate(
      dateTimeType === 'flightDateTime' ? 3 : 2,
      payload.submission[dateTimeType]
    ),
    forSelf: 'false',
    passengers: contactDetails.noOfPassengers
  };
};

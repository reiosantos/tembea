import Cache from '../../../../../cache';
import Utils from '../../../../../utils';

export default (payload, dateTimeType = 'flightDateTime') => {
  const {
    departmentId, departmentName, contactDetails, tripType
  } = Cache.fetch(payload.user.id);

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

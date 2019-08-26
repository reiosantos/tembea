import moment from 'moment-timezone';

/**
 * Get slack dateTime
 * @param {string} dateTime
 * @return {object} fallback and original date.
 */

export const getSlackDateTime = (dateTime) => {
  const newDateTime = new Date(dateTime);
  const [fallback, original] = [
    moment(newDateTime).format('ddd, MMM Do YYYY hh:mm a'),
    moment(newDateTime).unix()
  ];
  return {
    fallback,
    original
  };
};

/**
 * Get slack dateString
 * @param {string} dateTime
 * @return {sting} dateString.
 */

export const getSlackDateString = (dateTime) => {
  const newDateTime = new Date(dateTime);
  const [fallback, original] = [
    moment(newDateTime).format('ddd, MMM Do YYYY hh:mm a'),
    moment(newDateTime).unix()
  ];
  const date = new Date(0);
  date.setUTCSeconds(original);
  const year = date.getFullYear();
  return `<!date^${original}^{date_long} ${year} at {time}|${fallback}>`;
};

export const timeTo12hrs = (hrs24) => moment(hrs24, 'HH:mm', true)
  .format('hh:mm a')
  .toUpperCase();

const timeZones = Object.freeze({
  lagos: 'Africa/Lagos',
  cairo: 'Africa/Cairo',
  kampala: 'Africa/Kampala',
  kigali: 'Africa/Kigali',
  nairobi: 'Africa/Nairobi'
});
export const getTimezone = (homebase) => timeZones[homebase.toLowerCase()];

export const checkBeforeSlackDateString = (datetime) => {
  if (/^\d+-\d+-\d+T\d+:\d+:\d+.\d+Z$/.test(datetime)) {
    return getSlackDateString(datetime);
  }
  return datetime;
};

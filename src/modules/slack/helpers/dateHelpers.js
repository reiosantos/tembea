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
    fallback, original
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

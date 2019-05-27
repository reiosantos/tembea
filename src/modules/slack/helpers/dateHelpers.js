import moment from 'moment-timezone';

/**
 * Get slack dateTime
 * @param {string} dateTime
 * @return {object} fallback and original date.
 */

export const getSlackDateTime = (dateTime) => {
  const [fallback, original] = [
    moment(dateTime).format('ddd, MMM Do YYYY hh:mm a'),
    moment(dateTime).unix()
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
  const [fallback, original] = [
    moment(dateTime).format('ddd, MMM Do YYYY hh:mm a'),
    moment(dateTime).unix()
  ];
  const date = new Date(0);
  date.setUTCSeconds(original);
  const year = date.getFullYear();
  return `<!date^${original}^{date_long} ${year} at {time}|${fallback}>`;
};

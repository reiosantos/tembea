import AisService from '../../../services/AISService';
import slackService from '../../../helpers/slack/slackHelpers';
import cache from '../../../cache';

export function dateProcessor(date) {
  const [year, month, days] = date.split('-');
  const day = days.substr(0, 2);

  return `${day}/${month}/${year}`;
}

export function dateFaker(status, starting) {
  const date = new Date();
  const year = date.getFullYear();
  let fake;
  if (status === 'start') {
    fake = `01/01/${year}`;
  } else if (starting) {
    const endyear = parseInt(starting.split('/')[2], 0) + 4;
    fake = `${starting.split('/')[0]}/${starting.split('/')[1]}/${endyear}`;
  } else {
    fake = `01/01/${parseInt(year, 0) + 4}`;
  }
  return fake;
}

export class FormHandler {
  constructor(email) {
    this.email = email;
    this.userData = null;
  }

  async getUserDetails() {
    if (!this.userData) {
      this.userData = await AisService.getUserDetails(this.email);
    }
    return this.userData;
  }

  async getStartDate() {
    try {
      return dateProcessor(this.userData.placement.start_date);
    } catch (error) {
      return dateFaker('start', null);
    }
  }


  async getEndDate() {
    let processedDate;
    try {
      processedDate = dateProcessor(this.userData.placement.end_date);
    } catch (error) {
      if (this.userData.placement) {
        processedDate = dateFaker('end', dateProcessor(this.userData.placement.start_date));
      } else {
        processedDate = dateFaker('end', null);
      }
    }
    return processedDate;
  }

  async getPartnerStatus() {
    try {
      return this.userData.placement.client;
    } catch (error) {
      return '--';
    }
  }

  isFellowOnEngagement() {
    const { placement } = this.userData;
    return placement && placement.status.includes('External Engagements');
  }
}

export async function getFellowEngagementDetails(userId, teamId) {
  const getFellowKey = (userSlackId) => `userDetails${userSlackId}`;
  const userReturnData = await slackService.getUserInfoFromSlack(userId,
    teamId);
  const { profile: { email } } = userReturnData;
  const form = new FormHandler(email);
  await form.getUserDetails();
  if (!form.isFellowOnEngagement()) {
    return;
  }
  const [startDate, endDate, partnerStatus] = await Promise.all([
    form.getStartDate(),
    form.getEndDate(),
    form.getPartnerStatus()
  ]);
  await cache.saveObject(getFellowKey(userId), [startDate, endDate, partnerStatus]);
  return { startDate, endDate, partnerStatus };
}
/**
 * @param  {} data
 * @param  {} labelProp the property to use as the label
 * @param  {} valueProp the property to use as the value
 */
export const toLabelValuePairs = (data, { labelProp, valueProp }) => data.map((item) => ({
  label: item[labelProp],
  value: item[valueProp]
}));

export default {
  getFellowEngagementDetails, FormHandler, dateProcessor, dateFaker
};

import WebClientSingleton from '../utils/WebClientSingleton';
import bugsnagHelper from './bugsnagHelper';

export default async (dialogForm, teamBotOauthToken) => {
  try {
    await WebClientSingleton.getWebClient(teamBotOauthToken).dialog.open(dialogForm);
  } catch (error) {
    bugsnagHelper.log(error);
    throw new Error('There was a problem processing your request');
  }
};

import WebClientSingleton from '../utils/WebClientSingleton';

const web = new WebClientSingleton();

export default async (dialogForm, teamBotOauthToken) => {
  try {
    await web.getWebClient(teamBotOauthToken).dialog.open(dialogForm);
  } catch (error) {
    throw new Error('There was a problem processing your request');
  }
};

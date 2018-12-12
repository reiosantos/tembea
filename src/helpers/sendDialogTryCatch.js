import WebClientSingleton from '../utils/WebClientSingleton';

const web = new WebClientSingleton();

export default async (dialogForm) => {
  try {
    await web.getWebClient().dialog.open(dialogForm);
  } catch (error) {
    console.log(error);
    throw new Error('There was a problem processing your request');
  }
};

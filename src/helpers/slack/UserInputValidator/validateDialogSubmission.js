import Validators from './Validators';

const validateDialogSubmission = (payload) => {
  const { submission } = payload;
  const inputs = Object.keys(submission).map((key) => {
    const invalidInputs = Validators.checkEmpty(submission[key], key);
    if (invalidInputs.length !== 0) {
      const [error] = invalidInputs;
      return error;
    }
    return false;
  }).filter(items => items !== false);
  return inputs;
};

export default validateDialogSubmission;

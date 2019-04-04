import CleanData from '../helpers/cleanData';

class CleanRequestBody {
  static trimAllInputs(req, res, next) {
    if (req.body) {
      req.body = CleanData.trim(req.body);
    }
    return next();
  }
}

export default CleanRequestBody;

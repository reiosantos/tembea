import * as Joi from '@hapi/joi';

const tripPaymentSchema = Joi.object().keys({
  price: Joi.number().precision(2).min(0).strict()
});

export default tripPaymentSchema;

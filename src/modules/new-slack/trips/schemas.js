import * as Joi from '@hapi/joi';

export const tripPaymentSchema = Joi.object().keys({
  price: Joi.number().precision(2).min(0).strict()
});

export const tripReasonSchema = Joi.object().keys({
  reason: Joi.string().trim().required()
});

export const userTripPickupSchema = Joi.object().keys({
  dateTime: Joi.date().iso().required()
    .min(new Date(Date.now() + 300000)),
  // .max(new Date(Date.now() + 6480000000)),
  pickup: Joi.string().required(),
  othersPickup: Joi.string().when('pickup', {
    is: 'Others',
    then: Joi.string().required(),
    otherwise: Joi.string().valid(null)
  })
});

const customDestinationError = errors => errors.map((error) => {
  if (error.type === 'any.invalid') {
    Object.defineProperty(error, 'message', {
      enumerable: true,
      writable: true,
      value: 'Destination cannot be the same as origin'
    });
  }
  return error;
});

const destinationValidator = pickUp => Joi.string().required().invalid(pickUp)
  .error(customDestinationError, { self: true });

export const createUserDestinationSchema = pickUp => Joi.object().keys({
  destination: destinationValidator(pickUp),
  othersDestination: Joi.string().when('destination', {
    is: 'Others',
    then: destinationValidator(pickUp),
    otherwise: Joi.string().valid(null)
  })
});

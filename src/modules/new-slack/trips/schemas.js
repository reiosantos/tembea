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

export const createUserDestinationSchema = pickUp => Joi.object().keys({
  destination: Joi.string().required().invalid(pickUp),
  othersDestination: Joi.string().when('destination', {
    is: 'Others',
    then: Joi.string().required().invalid(pickUp),
    otherwise: Joi.string().valid(null)
  })
});

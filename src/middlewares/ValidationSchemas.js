import * as Joi from '@hapi/joi';
import JoiExtension from '@hapi/joi-date';

const extendedJoi = Joi.extend(JoiExtension);

const teamUrlRegex = /^(https?:\/\/)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*(slack\.com)$/;
const nameRegex = /^[A-Za-z ,.'-]+$/;
const numberRegex = /^\+?[0-9]+$/;
const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const requiredEmail = Joi.string().trim().email().required();
const requiredCountry = Joi.string().trim().required().regex(/^([a-zA-Z]+\s)*[a-zA-Z]+$/);
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const Stringregex = /([A-Z])\w+/;

export const querySchema = Joi.object().keys({
  page: Joi.number().min(1),
  size: Joi.number().min(1),
  id: Joi.number().min(1),
  providerId: Joi.number().min(1),
  sort: Joi.string(),
  status: Joi.string().valid('Active', 'Inactive'),
  name: Joi.string().replace(/[^a-z0-9\s]/gi, ''),
  country: Joi.string().replace(/[^a-z0-9\s]/gi, ''),
  onRoute: Joi.boolean()
});

const whenConfirm = type => Joi.number().when(
  'action', {
    is: 'confirm',
    then: type === 'number'
      ? Joi.number().required()
      : Joi.string().trim().required()
  }
);

const whenDecline = Joi.string().when(
  'action', {
    is: 'decline',
    then: Joi.any().forbidden()
  }
);

const whenConfirmOrDecline = whenConfirm('number').concat(whenDecline);

export const getTripsSchema = Joi.object().keys({
  page: Joi.number(),
  size: Joi.number(),
  status: Joi.string().trim().valid('Confirmed', 'Pending', 'Approved', 'Completed',
    'DeclinedByManager', 'DeclinedByOps', 'InTransit', 'Cancelled')
});

export const tripUpdateSchema = Joi.object().keys({
  action: Joi.string(),
  tripId: Joi.number().required(),
  comment: Joi.string().trim().required(),
  slackUrl: Joi.string().trim().required().regex(teamUrlRegex),
  providerId: whenConfirmOrDecline
});

export const userUpdateSchema = Joi.object().keys({
  slackUrl: Joi.string().trim().required().regex(teamUrlRegex),
  email: Joi.string().trim().email().required(),
  newEmail: Joi.string().trim().email(),
  newName: Joi.string().trim().regex(nameRegex),
  newPhoneNo: Joi.string().trim().regex(numberRegex)
}).or('newEmail', 'newName', 'newPhoneNo');

export const newUserSchema = Joi.object().keys({
  slackUrl: Joi.string().trim().required().regex(teamUrlRegex),
  email: requiredEmail
});

const ViableProviderSchema = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().trim().required(),
  providerUserId: Joi.number().required(),
  isDirectMessage: Joi.boolean().required(),
  channelId: Joi.string().allow(null).optional(),
  vehicles: Joi.array(),
  drivers: Joi.array(),
  homebaseId: Joi.number(),
  user: Joi.object().keys({
    name: Joi.string().trim(),
    phoneNo: Joi.string().trim().allow(null).optional(),
    email: Joi.string().trim().email(),
    slackId: Joi.string().trim()
  })
});

export const newRouteSchema = Joi.object().keys({
  routeName: Joi.string().trim().required().replace(/[^a-z0-9\s]/gi, ''),
  destination: Joi.object().keys({
    address: Joi.string().trim().required().replace(/[^a-z0-9\s,]/gi, ''),
    coordinates: Joi.object().keys({
      lng: Joi.number().min(-180).max(180)
        .required(),
      lat: Joi.number().min(-86).max(86)
        .required()
    }).required()
  }).required(),
  teamUrl: Joi.string().trim().required().regex(teamUrlRegex),
  destinationInputField: Joi.string().trim(),
  provider: ViableProviderSchema.required(),
  takeOffTime: Joi.string().trim().required().regex(timeRegex),
  capacity: Joi.number().required().min(1)
});

export const updateRouteSchema = Joi.object().keys({
  teamUrl: Joi.string().trim().required().regex(teamUrlRegex),
  status: Joi.string().trim().valid('Inactive', 'Active'),
  batch: Joi.string().trim(),
  capacity: Joi.number().min(1),
  takeOff: Joi.string().trim().regex(timeRegex),
  providerId: Joi.number().min(1),
  regNumber: Joi.string().trim().replace(/[^a-z0-9\s]/gi, ''),
  name: Joi.string().trim().replace(/[^a-z0-9\s]/gi, '')
});

export const declineRouteRequestSchema = Joi.object().keys({
  newOpsStatus: Joi.string().trim().valid('approve', 'decline').required(),
  comment: Joi.string().trim().required().replace(/[^a-z0-9\s]/gi, ''),
  teamUrl: Joi.string().trim().required().regex(teamUrlRegex),
});

export const approveRouteRequestSchema = Joi.object().keys({
  teamUrl: Joi.string().trim().required().regex(teamUrlRegex),
  newOpsStatus: Joi.string().trim().valid('approve', 'decline').required(),
  comment: Joi.string().trim().required().replace(/[^a-z0-9\s]/gi, ''),
  routeName: Joi.string().trim().required().replace(/[^a-z0-9\s]/gi, ''),
  takeOff: Joi.string().trim().regex(timeRegex).required(),
  provider: ViableProviderSchema.required()
});

export const deleteRouteSchema = Joi.object().keys({
  teamUrl: Joi.string().trim().required().regex(teamUrlRegex)
});

export const assignRoleSchema = Joi.object().keys({
  email: requiredEmail,
  roleName: Joi.string().trim().required(),
  homebaseId: Joi.number().required()
});

export const getRoleSchema = Joi.object().keys({
  email: requiredEmail
});

export const newRoleSchema = Joi.object().keys({
  roleName: Joi.string().trim().required().replace(/[^a-z0-9\s]/gi, '')
});

export const updateProviderSchema = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().trim(),
  email: Joi.string().trim().email()
}).or('name', 'email');

export const newProviderSchema = Joi.object().keys({
  email: Joi.string().trim().email().required(),
  name: Joi.string().trim().required(),
  isDirectMessage: Joi.boolean().optional(),
  channelId: Joi.string().allow(null, '').optional(),
}).with('channelId', 'isDirectMessage');

export const newHomeBaseSchema = Joi.object().keys({
  homebaseName: Joi.string().trim().required(),
  countryId: Joi.number().required(),
  channel: Joi.string().trim().required()
}).min(3).max(3);

export const updateHomeBaseSchema = Joi.object().keys({
  countryId: Joi.number().optional(),
  homebaseName: Joi.string().trim().optional(),
  channel: Joi.string().trim().optional(),
}).min(1);

export const newDriverSchema = Joi.object().keys({
  driverPhoneNo: Joi.number().required().min(3),
  driverName: Joi.string().trim().required(),
  driverNumber: Joi.string().trim().required().min(3),
  providerId: Joi.number().required(),
  email: Joi.string().trim().email(),
  userId: Joi.number()
});

export const updateDriverSchema = Joi.object().keys({
  driverPhoneNo: Joi.number().min(3),
  driverName: Joi.string().trim(),
  driverNumber: Joi.string().trim().min(3),
  email: Joi.string().trim().email(),
  userId: Joi.number().optional()
}).min(1);

export const newDepartmentSchema = Joi.object().keys({
  name: Joi.string().trim().required().replace(/[^a-z\s-]/gi, ''),
  email: requiredEmail,
  slackUrl: Joi.string().trim().required().regex(teamUrlRegex),
  homebaseId: Joi.number().required()
});

export const updateDepartmentSchema = Joi.object().keys({
  name: Joi.string().trim().replace(/[^a-z\s-]/gi, '').optional(),
  headEmail: Joi.string().trim().email().optional(),
}).min(1).max(2);

export const deleteDepartmentSchema = Joi.object().keys({
  id: Joi.number().min(1),
  name: Joi.string().trim().replace(/[^a-z0-9\s-]/gi, '')
}).min(1).max(1);

export const countrySchema = Joi.object().keys({
  name: requiredCountry
});

export const updateCountrySchema = Joi.object().keys({
  name: requiredCountry,
  newName: requiredCountry
});

export const newCabSchema = Joi.object().keys({
  driverName: Joi.string().trim().replace(/[^a-z0-9\s]/gi, ''),
  driverPhoneNo: Joi.number().min(3),
  regNumber: Joi.string().trim().replace(/[^a-z0-9\s]/gi, '').required(),
  providerId: Joi.number().required().min(1),
  capacity: Joi.number().min(1).required(),
  model: Joi.string().trim().required().replace(/[^a-z0-9\s]/gi, ''),
  location: Joi.string().trim().replace(/[^a-z\s-]/gi, '')
});

export const updateCabSchema = Joi.object().keys({
  id: Joi.number().min(1).required(),
  regNumber: Joi.string().trim().replace(/[^a-z0-9\s]/gi, '').required(),
  capacity: Joi.number().min(1),
  model: Joi.string().trim().replace(/[^a-z0-9\s]/gi, '')
}).min(1);

export const newAddressSchema = Joi.object().keys({
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-86).max(86).required(),
  address: Joi.string().trim().required().replace(/[^a-z0-9\s,]/gi, '')
});

export const updateAddressSchema = Joi.object().keys({
  newLongitude: Joi.number().min(-180).max(180),
  newLatitude: Joi.number().min(-86).max(86),
  address: Joi.string().trim().required().replace(/[^a-z0-9\s,]/gi, ''),
  newAddress: Joi.string().trim().replace(/[^a-z0-9\s,]/gi, '')
}).or('newLongitude', 'newLatitude', 'newAddress');

export const departmentTripsSchema = Joi.object().keys({
  startDate: Joi.string().required().regex(dateRegex)
    .error(() => 'StartDate must be in the format YYYY-MM-DD and is required'),
  endDate: Joi.string().required().regex(dateRegex)
    .error(() => 'endDate must be in the format YYYY-MM-DD and is required'),
  departments: Joi.array()
});

export const travelTripSchema = Joi.object().keys({
  startDate: Joi.date().iso().label('start Date').required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
    .label('end Date')
    .required(),
  departmentList:
          Joi.array()
            .items(Joi.string().trim().label('Departments'))
            .min(1).allow(null)
            .optional()
});

export const tripTypeSchema = Joi.object().keys({
  tripType: Joi.string().valid('Embassy Visit', 'Airport Transfer', 'Regular Trip')
    .regex(Stringregex)
    .error(() => 'tripType must be either Embassy Visit, Airport Transfer or Regular Trip'),
});

/* The "and" in this validation makes sure that both "from" and "to" fields are
 supplied or none is supplied. In which case, it it will load data from the previous month.
 Also, extendedJoi was used to incoporate .format('YYYY-MM-DD') */
export const dateRangeSchema = Joi.object().keys({
  from: extendedJoi.date().format('YYYY-MM-DD').iso().label('from')
    .required(),
  to: extendedJoi.date().format('YYYY-MM-DD').iso().min(Joi.ref('from')),
}).and('from', 'to').required();

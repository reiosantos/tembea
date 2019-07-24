import * as Joi from '@hapi/joi';

const teamUrlRegex = /^(https?:\/\/)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*(slack\.com)$/;
const nameRegex = /^[A-Za-z ,.'-]+$/;
const numberRegex = /^\+?[0-9]+$/;
const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const requiredEmail = Joi.string().trim().email().required();
const requiredCountry = Joi.string().trim().required().regex(/^([a-zA-Z]+\s)*[a-zA-Z]+$/);
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const querySchema = Joi.object().keys({
  page: Joi.number().min(1),
  size: Joi.number().min(1),
  id: Joi.number().min(1),
  providerId: Joi.number().min(1),
  sort: Joi.string(),
  name: Joi.string().replace(/[^a-z0-9\s]/gi, ''),
  country: Joi.string().replace(/[^a-z0-9\s]/gi, '')
});

const whenConfirm = Joi.string().when(
  'action', {
    is: 'confirm',
    then: Joi.string().trim().required()
  }
);

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
  isAssignProvider: Joi.boolean().default(false),
  driverName: whenConfirm,
  driverPhoneNo: whenConfirm,
  regNumber: whenConfirm
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
  roleName: Joi.string().trim().required()
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
  name: Joi.string().trim().required()
});

export const newHomeBaseSchema = Joi.object().keys({
  homebaseName: Joi.string().trim().required(),
  countryName: requiredCountry
});

export const newDriverSchema = Joi.object().keys({
  driverPhoneNo: Joi.number().required().min(3),
  driverName: Joi.string().trim().required(),
  driverNumber: Joi.string().trim().required().min(3),
  providerId: Joi.number().required(),
  email: Joi.string().trim().email()
});

export const updateDriverSchema = Joi.object().keys({
  driverPhoneNo: Joi.number().min(3),
  driverName: Joi.string().trim(),
  driverNumber: Joi.string().trim().min(3),
  email: Joi.string().trim().email()
}).min(1);

export const newDepartmentSchema = Joi.object().keys({
  name: Joi.string().trim().required().replace(/[^a-z\s-]/gi, ''),
  email: requiredEmail,
  slackUrl: Joi.string().trim().required().regex(teamUrlRegex),
  location: Joi.string().trim().required().replace(/[^a-z\s-]/gi, '')
});

export const updateDepartmentSchema = Joi.object().keys({
  name: Joi.string().trim().required().replace(/[^a-z\s-]/gi, ''),
  newName: Joi.string().trim().replace(/[^a-z0-9\s-]/gi, ''),
  newHeadEmail: Joi.string().trim().email(),
  location: Joi.string().trim().replace(/[^a-z\s-]/gi, '')
});

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
  endDate: Joi.date().iso().greater(Joi.ref('startDate'))
    .label('end Date')
    .required(),
  departmentList:
          Joi.array()
            .items(Joi.string().trim().label('Departments'))
            .min(1)
            .required()
});

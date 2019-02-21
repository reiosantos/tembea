/* eslint-disable indent */
import TripValidator from '../TripValidator';
import HttpError from '../../helpers/errorHandler';
import GeneralValidator from '../GeneralValidator';
import TripServices from '../../services/TripServices';

describe('Trip Validator', () => {
    let req;
    let reqDecline;
    let res;
    let next;
    let resolved;

    beforeEach(() => {
        req = {
            body: {
                driverPhoneNo: '0777777777',
                driverName: 'nnn',
                regNumber: 'lmnbv',
                comment: 'ns',
                slackUrl: 'sokoolworkspace.slack.com',
                userEmail: 'paul.soko@andela.com'
            },
            params: { tripId: 15 },
            status: 200,
            query: { action: 'confirm' }
        };
        reqDecline = {
            body: {
                comment: 'ns',
                slackUrl: 'sokoolworkspace.slack.com'
            },
            params: { tripId: 15 },
            status: 200,
            query: { action: 'decline' }
        };
        res = {
            status: jest
                .fn(() => ({
                    json: jest.fn(() => { })
                }))
                .mockReturnValue({ json: jest.fn() })
        };
        next = jest.fn();
    });


    afterEach(async (done) => {
        jest.restoreAllMocks();
        done();
    });

    describe('validateAll method', () => {
        beforeEach(() => {
            resolved = {
                success: false,
                message: 'Some properties are missing for approval',
                errors: [
                    'Please provide driverPhoneNo.'
                ]
            };
        });
        it('should call validateAll with all values for confirm with non existing trip', async (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(TripServices, 'findTrip')
                .mockResolvedValue(false);

            await TripValidator.validateAll(req, res, next);
            expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledTimes(0);
            done();
        });
        it('should call validateAll with all values for confirm', async (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(TripServices, 'findTrip')
                .mockResolvedValue(true);

            await TripValidator.validateAll(req, res, next);
            expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledTimes(1);
            done();
        });
        it('should call validateAll with all values for decline', async (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(TripServices, 'findTrip')
                .mockResolvedValue(true);

            await TripValidator.validateAll(reqDecline, res, next);
            expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledTimes(1);
            done();
        });
        it('should call validateAll with missing driverPhoneNo ', async (done) => {
            req.body.driverPhoneNo = null;
            HttpError.sendErrorResponse = jest.fn(() => { });
            resolved.errors[0] = 'Please provide driverPhoneNo.';
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(TripServices, 'findTrip')
                .mockResolvedValue(true);

            await TripValidator.validateAll(req, res, next);
            expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
            expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: ['Please provide driverPhoneNo.'] }, res);
            expect(next).toHaveBeenCalledTimes(0);
            done();
        });
        it('should call validateAll with missing tripId ', async (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            req.params.tripId = null;
            resolved.errors[0] = 'Add tripId to the url';
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(TripServices, 'findTrip')
                .mockResolvedValue(true);

            await TripValidator.validateAll(req, res, next).then(() => {
                expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
                expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: ['Add tripId to the url'] }, res);
            });
            done();
        });
    });
    describe('validateEachInput method', () => {
        beforeEach(() => {
            resolved = {
                success: false,
                message: 'Some properties are not valid',
                errors: [
                    {
                        name: 'slackUrl',
                        error: 'Invalid slackUrl. e.g: ACME.slack.com'
                    }
                ]
            };
        });
        it('should call validateAll with all values ', (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);

            TripValidator.validateEachInput(req, res, next);
            expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledTimes(1);
            done();
        });
        it('should call validateAll with invalid driverPhoneNo ', (done) => {
            req.body.driverPhoneNo = 'sdd';
            HttpError.sendErrorResponse = jest.fn(() => { });
            resolved.errors[0] = { error: 'Invalid phone number!', name: 'driverPhoneNo' };
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);

            TripValidator.validateEachInput(req, res, next).then(() => {
                expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
                expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({}, resolved.message, resolved.errors);
                expect(next).toHaveBeenCalledTimes(0);
            });
            done();
        });
        it('should call validateAll with invalid tripId ', (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            req.params.tripId = 'we';
            resolved.errors[0] = { error: 'Invalid tripId in the url it must be a number. eg: api/v1/trips/12/confirm', name: 'tripId' };
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);

            TripValidator.validateEachInput(req, res, next).then(() => {
                expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
                expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({}, resolved.message, resolved.errors);
            });
            done();
        });
        it('should call validateAll with invalid slackUrl ', (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            req.body.slackUrl = 'sokoolworkspaceslack.com';
            resolved.errors[0] = {
                name: 'slackUrl',
                error: 'Invalid slackUrl. e.g: ACME.slack.com'
            };
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(GeneralValidator, 'validateTeamUrl')
                .mockReturnValue(false);

            TripValidator.validateEachInput(req, res, next).then(() => {
                expect(GeneralValidator.validateTeamUrl).toHaveBeenCalledTimes(1);
                expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({}, resolved.message, resolved.errors);
            });
            done();
        });
        it('should call validateAll with invalid userEmail', (done) => {
            HttpError.sendErrorResponse = jest.fn(() => { });
            req.body.userEmail = 'paul.com';
            req.body.slackUrl = 'sokoolworkspace.slack.com';
            resolved.errors[0] = {
                name: 'userEmail',
                error: 'Invalid userEmail.'
            };
            jest.spyOn(HttpError, 'sendErrorResponse')
                .mockResolvedValue(resolved);
            jest.spyOn(GeneralValidator, 'validateTeamUrl')
                .mockReturnValue(true);

            TripValidator.validateEachInput(req, res, next);
            expect(GeneralValidator.validateTeamUrl).toHaveBeenCalledTimes(1);
            done();
        });
    });
});

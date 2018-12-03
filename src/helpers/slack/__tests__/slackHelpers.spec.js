import sinon from 'sinon';
import models from '../../../database/models';
import SlackHelpers from '../slackHelpers';

const { TripRequest, User, Department } = models;

let sandbox;
let tripFindByPkStub;
let userFindByPkStub;
let deptFindByPkStub;

describe('slack Helpers', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    tripFindByPkStub = sandbox.stub(TripRequest, 'findByPk');
    userFindByPkStub = sandbox.stub(User, 'findOne');
    deptFindByPkStub = sandbox.stub(Department, 'findAll');

    tripFindByPkStub.returns(Promise.resolve(
      { dataValues: { approvedById: null, tripStatus: 'Pending' } }
    ));
    userFindByPkStub.returns(Promise.resolve({ dataValues: { id: 45 } }));
    deptFindByPkStub.returns(Promise.resolve([{ dataValues: { id: 45 } }]));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return user object', async (done) => {
    const user = await SlackHelpers.findUserByIdOrSlackId('U4500');
    expect(user).toEqual({ id: 45 });
    done();
  });

  it('should return selected department', async (done) => {
    await SlackHelpers.getDepartments();
    done();
    const dept = SlackHelpers.findSelectedDepartment('45');
    expect(dept).resolves.toEqual([{ dataValues: { id: 45 } }]);
  });

  it('should throw an error on invalid ID', () => {
    const throws = () => SlackHelpers.findSelectedDepartment('UE45');
    expect(throws).toThrow();
  });

  it('should return trip status object with approved false', async (done) => {
    const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
    expect(trip).toEqual({ approvedBy: null, isApproved: false });
    done();
  });

  it('should return trip status object with approved false on !trip.dataValues', async (done) => {
    tripFindByPkStub.returns(Promise.resolve({ }));
    const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
    expect(trip).toEqual({ approvedBy: null, isApproved: false });
    done();
  });

  it('should return trip status object with approved true', async (done) => {
    tripFindByPkStub.returns(Promise.resolve(
      { dataValues: { approvedById: 6, tripStatus: 'Approved' } }
    ));
    const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
    expect(trip).toEqual({ approvedBy: '<@undefined>', isApproved: true });
    done();
  });

  it('should approved request', async (done) => {
    tripFindByPkStub.returns(Promise.resolve(
      { dataValues: { }, update: jest.fn(() => Promise.resolve({})) }
    ));
    const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
    expect(trip).toBeTruthy();
    done();
  });

  it('should not approved request but should not throw', async (done) => {
    tripFindByPkStub.returns(Promise.resolve());
    const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
    expect(trip).toBeFalsy();
    done();
  });

  it('should not approved, user in not found request but should not throw', async (done) => {
    tripFindByPkStub.returns(Promise.resolve({}));
    userFindByPkStub.returns(Promise.resolve({}));
    const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
    expect(trip).toBeFalsy();
    done();
  });
});

describe('test getUser by slackId ', () => {
  it("should return null when user isn't found", async (done) => {
    const result = await SlackHelpers.getUserBySlackId('1aaaaBa');
    expect(result).toEqual(null);
    done();
  });

  it('should throw an error when an invalid slackId type is passed', async (done) => {
    try {
      await SlackHelpers.getUserBySlackId(1);
    } catch (error) {
      expect(error.message).toEqual('operator does not exist: character varying = integer');
    }
    done();
  });

  it('should return user', async (done) => {
    const result = await SlackHelpers.getUserBySlackId('TEST123');
    expect(result).toHaveProperty('email', 'test.buddy1@andela.com');
    done();
  });
});

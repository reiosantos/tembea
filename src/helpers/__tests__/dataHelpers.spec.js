import DataHelpers from '../dataHelpers';

describe('Data helper', () => {
  it('should get all the departments in the database', async (done) => {
    const departments = await DataHelpers.getDepartments();
    const expected = [
      { label: 'TDD', value: 1 },
      { label: 'Travel', value: 2 },
      { label: 'People', value: 3 }
    ];

    expect(departments).toEqual(expected);
    expect(departments.length).toBe(3);
    done();
  });

  it('should get the head of department by departmentId', async (done) => {
    const departmentHead = await DataHelpers.getHeadByDepartmentId(3);

    expect(departmentHead.id).toBe(6);
    expect(departmentHead.email).toBe('opeoluwa.iyi-kuyoro@andela.com');
    done();
  });
  
  it('should get user by id', async (done) => {
    const user = await DataHelpers.getUserById(6);
    
    expect(user.id).toBe(6);
    expect(user.email).toBe('opeoluwa.iyi-kuyoro@andela.com');
    done();
  });

  it('should get a trip request by id', async (done) => {
    const tripRequest = await DataHelpers.getTripRequest(1);

    expect(tripRequest.name).toBe('my trip home');
    expect(tripRequest.riderId).toBe(1);
    expect(tripRequest.tripStatus).toBe('Pending');
    done();
  });
});

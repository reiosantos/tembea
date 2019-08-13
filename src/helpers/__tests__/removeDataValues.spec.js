import RemoveDataValues from '../removeDataValues';

describe('RemoveDataValues', () => {
  it('should test removeDataValues method strips dataValues', async () => {
    const tripBefore = {
      dataValues: {
        id: 1,
        name: 'Lagos to Nairobi',
        status: 'Pending',
        rider: {
          dataValues: {
            id: 3,
            name: 'James',
            head: {
              dataValues: {
                id: 10,
                title: 'Head of department'
              }
            }
          }
        }
      }
    };
    const tripAfter = {
      id: 1,
      name: 'Lagos to Nairobi',
      status: 'Pending',
      rider: {
        id: 3,
        name: 'James',
        head: {
          id: 10,
          title: 'Head of department'
        }
      }
    };
    const result = RemoveDataValues.removeDataValues(tripBefore);
    expect(result).toEqual(tripAfter);
  });

  it('should apply to objects in an array', () => {
    const nestedObj = { id: 2, name: 'Tembea' };
    const mainObject = [
      {
        dataValues: {
          id: 1,
          name: 'Test 1',
          users: [
            {
              dataValues: nestedObj
            }
          ]
        }
      }
    ];
    const after = [
      {
        ...mainObject[0].dataValues
      }
    ];
    after[0].users[0] = { ...nestedObj };
    const result = RemoveDataValues.removeDataValues(mainObject);
    expect(result).toEqual(after);
  });
});

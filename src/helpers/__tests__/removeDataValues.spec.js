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
});

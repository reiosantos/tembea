import TripHelper from './TripHelper';

describe('TripHelper', () => {
  it('should validate ', () => {
    let result = TripHelper.cleanDateQueryParam(
      { departureTime: 'after:2018-10-10;before:2018-01-10' }, 'departureTime'
    );
    expect(result).toEqual({ after: '2018-10-10', before: '2018-01-10' });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'after:2018-10-10' }, 'departureTime'
    );

    expect(result).toEqual({ after: '2018-10-10' });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'before:2018-01-10' }, 'departureTime'
    );
    expect(result)
      .toEqual({
        before: '2018-01-10'
      });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'before' }, 'departureTime'
    );
    expect(result)
      .toEqual({
        before: undefined
      });

    result = TripHelper.cleanDateQueryParam(
      { departureTime: 'besfore:121212;afefd:1212122' }, 'usefc'
    );
    expect(result)
      .toEqual(undefined);
  });
});

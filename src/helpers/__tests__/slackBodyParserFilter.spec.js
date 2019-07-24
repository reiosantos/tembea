import SlackBodyParserFilter from '../slackBodyParserFilter';

describe('SlackBodyParserFilter', () => {
  it('should call next if /slack/actions provided', () => {
    const req = {
      path: '/slack/actions',
    };
    const next = jest.fn();
    const maybeFn = SlackBodyParserFilter.maybe(() => {});
    maybeFn(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
});

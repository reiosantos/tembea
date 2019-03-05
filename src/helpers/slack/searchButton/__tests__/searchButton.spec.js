import searchButton from '../index';

describe('Search Button', () => {
  it('should return an attachment object for search button', () => {
    const attachment = searchButton('some_callbackId', 'Search');
    expect(attachment.actions.length).toEqual(1);
  });
});

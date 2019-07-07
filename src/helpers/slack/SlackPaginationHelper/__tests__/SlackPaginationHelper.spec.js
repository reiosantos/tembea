import SlackPagination from '../index';

describe('SlackPagination', () => {
  let payload;

  beforeEach(() => {
    payload = {
      actions: [{ name: 'page_2' }]
    };
  });

  describe('SlackPagination_createPaginationAttachment', () => {
    it('Should display the next pagination button', async () => {
      payload.actions[0].name = 'upcoming';
      const pageButtons = SlackPagination.createPaginationAttachment(
        'trip_itinerary', 'view_upcoming_trips', payload, 10, 1
      );
      expect(pageButtons.actions[1].text).toEqual('Next >');
    });
    it('Should display previous, next and Skip to page button', async () => {
      const pageButtons = SlackPagination.createPaginationAttachment(
        'trip_itinerary', 'view_upcoming_trips', payload, 21, 3
      );
      expect(pageButtons.actions[0].text).toEqual('< Prev');
      expect(pageButtons.actions[1].text).toEqual('Next >');
      expect(pageButtons.actions[2].text).toEqual('Skip to page');
    });
    it('Should display the previous pagination button', async () => {
      const pageButtons = SlackPagination.createPaginationAttachment(
        'trip_itinerary', 'view_upcoming_trips', payload, 1, 1
      );
      expect(pageButtons.actions[0].text).toEqual('< Prev');
    });
    it('Should display both next and skip to page buttons', async () => {
      const pageButtons = SlackPagination.createPaginationAttachment(
        'trip_itinerary', 'view_upcoming_trips', 1, 1
      );
      expect(pageButtons.actions[0].text).toEqual('Next >');
      expect(pageButtons.actions[1].text).toEqual('Skip to page');
    });
    it('Should display both prev and skip to page buttons', async () => {
      const pageButtons = SlackPagination.createPaginationAttachment(
        'trip_itinerary', 'view_upcoming_trips', 2, 1
      );
      expect(pageButtons.actions[0].text).toEqual('< Prev');
      expect(pageButtons.actions[1].text).toEqual('Skip to page');
    });
  });
  describe('SlackPagination_getPageNumber', () => {
    it('should return the page number', () => {
      const pageNumber = SlackPagination.getPageNumber('page_2');
      expect(pageNumber).toEqual(2);
    });
    it('should return the default page number', () => {
      const pageNumber = SlackPagination.getPageNumber('upcoming');
      expect(pageNumber).toEqual(1);
    });
  });
  describe('SlackPagination_getSlackPageSize', () => {
    it('should return the page number', () => {
      const slackPageSize = SlackPagination.getSlackPageSize();
      expect(slackPageSize).not.toBeNull();
      expect(slackPageSize).not.toBe('string');
      expect(slackPageSize).not.toBeLessThan(1);
    });
  });
});

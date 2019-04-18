import RoutesHelpers from '../routesHelper';
import routesData from './routeDummyData';
import SlackPagination from '../../../../helpers/slack/SlackPaginationHelper';

const { items, totalPages, currentPage } = routesData;

describe('RoutesHelpers', () => {
  describe('RoutesHelpers__createRouteAttachment', () => {
    it('should formant all available routes', () => {
      const result = RoutesHelpers.createRouteAttachment(items);
      expect(result).toHaveProperty('fields');
    });
  });
  describe('RoutesHelpers__toAvailableRoutesAttachment', () => {
    beforeEach(() => {
      jest.spyOn(SlackPagination, 'createPaginationAttachment');
    });

    it('should display a message when there are is no available routes', () => {
      const res = RoutesHelpers.toAvailableRoutesAttachment([], 2, 5);
      const { attachments: [SlackInteractiveMessage] } = res;
      expect(SlackInteractiveMessage.text).toEqual('Sorry, route not available at the moment :disappointed:');
    });

    it('should render attachment if their is available route with pagination attachment', () => {
      const res = RoutesHelpers.toAvailableRoutesAttachment(items, totalPages, currentPage);
      expect(SlackPagination.createPaginationAttachment).toBeCalled();
      expect(res.text).toEqual('*All Available Routes:slightly_smiling_face:*');
    });
  });
});

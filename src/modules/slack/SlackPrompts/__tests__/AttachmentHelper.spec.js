import AttachmentHelper from '../notifications/AttachmentHelper';

describe('AttachmentHelper', () => {
  describe('AttachmentHelper_commentAttachment', () => {
    it('should get a null when their is no manager and Opps has no comment', () => {
      const routeRequest = { managerComment: '', opsComment: '' };
      const res = AttachmentHelper.commentAttachment(routeRequest);
      expect(res).toBeNull();
    });
    it('should create attachment when manager and Opps has comment', () => {
      const routeRequest = { managerComment: 'LGTM', opsComment: 'LGTM' };
      const res = AttachmentHelper.commentAttachment(routeRequest);
      expect(res).toBeTruthy();
    });
    it('should create attachment when only Opps has comment', () => {
      const routeRequest = { managerComment: '', opsComment: 'LGTM' };
      const res = AttachmentHelper.commentAttachment(routeRequest);
      expect(res).toBeTruthy();
    });
  });
});

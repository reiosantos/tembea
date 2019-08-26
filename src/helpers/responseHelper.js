class Response {
  static sendResponse(res, code, success, message, data) {
    return res.status(code).json({
      success,
      message,
      data
    });
  }
}

export const getPaginationMessage = (pageMeta) => (
  `${pageMeta.pageNo} of ${pageMeta.totalPages} page(s).`
);

export default Response;

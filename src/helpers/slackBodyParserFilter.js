export default class SlackBodyParserFilter {
  static maybe(fn) {
    return (req, res, next) => {
      if (req.path.indexOf('/slack/actions') !== -1) {
        next();
      } else {
        fn(req, res, next);
      }
    };
  }
}

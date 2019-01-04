
class EmailController {
  static generateTemplate(req, res, hbs) {
    const dataFields = req.body;

    const html = hbs.render(`${hbs.baseTemplates}/email/email.html`, { ...dataFields });

    html.then(data => res.send(data));
  }
}

export default EmailController;

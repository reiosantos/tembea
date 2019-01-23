import exphbs from 'express-handlebars';

const hbsConfig = (app) => {
  const hbs = exphbs.create({
    defaultLayout: '_layout.html',
    baseTemplates: app.get('views'),
    layoutsDir: `${app.get('views')}/layouts`,
    partialsDir: [`${app.get('views')}/partials`]
  });

  return hbs;
};

export default hbsConfig;

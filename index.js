const express = require('express');

const app = express();
const port = 9614;

const thumbnailer = require('./thumbnailer');

// Custom error responses
function error(res, code, err) {
  console.error(`${code}: ${err}`);
  console.trace(err);

  res.json({ error: `${err}` }).status(code).end();
}

app.get('/thumbnail/:protocol/:cid/:width/:height', (req, res, next) => {
  // TODO: Validation
  // https://express-validator.github.io/docs/
  const { protocol, cid, width, height } = req.params;
  const url = thumbnailer(protocol, cid, width, height);
  res.redirect(url);
});

app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    // Don't leak details in production
    error(res, 500, 'Internal Server Error');
  }

  if (res.headersSent) {
    return next(err);
  }

  error(res, 500, err);
});

app.listen(port, () => console.log(`nyats server listening on port ${port}!`));

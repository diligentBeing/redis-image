const { createLogger, transports, format } = require('winston');

let transportArray = [
  new transports.File({
    filename: './logs/info.log',
    level: 'info',
    format: format.combine(format.timestamp(), format.simple()),
  }),
  new transports.Console({
    level: 'debug',
    format: format.combine(format.timestamp(), format.simple()),
  }),
];

if (process.env.NODE_ENV === 'development') {
  transportArray.push(
    new transports.File({
      filename: './logs/debug.log',
      level: 'debug',
      format: format.combine(format.timestamp(), format.simple()),
    })
  );
}

const logger = createLogger({
  transports: transportArray,
});

module.exports = logger;

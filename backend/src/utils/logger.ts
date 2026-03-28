import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Development: colored, human-readable
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// Production: structured JSON for log aggregation (Datadog, CloudWatch, etc.)
const prodFormat = combine(
  timestamp(),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'http' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'ayers-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;

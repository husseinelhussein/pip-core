import * as bodyParser from 'body-parser';

export const formBodyParserMiddleware = bodyParser.urlencoded({ extended: true, type: 'application/x-www-form-urlencoded' });
export const jsonBodyParserMiddleware = bodyParser.json({ type: 'application/*' });

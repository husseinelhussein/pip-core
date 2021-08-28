import * as morgan from 'morgan';
import rfs from "rotating-file-stream";

morgan.token('sanitized-body', (req:any,res) => {
    if (req && req.body) {
        if (req.body.password) {
            req.body.password = '**REDACTED**';
        }
        return JSON.stringify(req.body);
    }

    return '';
});

const morganTokenString =
    ':remote-addr :[:date[web]] ":method :url" :status :sanitized-body';
const log_dir = __dirname + '/../../log';
// create a rotating write stream
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: log_dir,
});
const morganMiddleware = morgan(morganTokenString, {
    skip(req, res) {
        if (
            res.statusCode >= 400 ||
            process.env.LOG_SUCCESSFUL_REQUESTS ||
            req.method === 'POST' ||
            req.method === 'PATCH' ||
            req.method === 'PUT' ||
            req.method === 'DELETE'
        ) {
            return false;
        }
        return true;
    },
    stream: accessLogStream
});

export default morganMiddleware;

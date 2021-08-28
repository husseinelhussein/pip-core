import * as winston from 'winston';
const log_dir = __dirname + "/../../../log";
import * as util from "util";
winston.configure({exitOnError: false});
//
// If we're not in production then log to the `console`:
//
function transform(info:any, opts:any) {
    const args = info[Symbol.for('splat')];
    if (args) { info.message = util.format(info.message, ...args); }
    return info;
}
function utilFormatter() { return {transform}; }

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    exitOnError: false,
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: log_dir + '/combined.log'}),
        new winston.transports.Stream({
            format: winston.format.combine(
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
                utilFormatter(),     // <-- this is what changed
                winston.format.colorize(),
                winston.format.printf(({level, message, label, timestamp}) => `${timestamp} ${label || '-'} ${level}: ${message}`),
            ),
            handleExceptions: true,
            stream: process.stderr,
            level: "debug",
            eol: "\r\n",
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: log_dir + '/exceptions.log',
        },)
    ],
});

export default logger;
import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err.statusCode) {
        return res.status(err.statusCode).send(err.message);
    }
    if (process.env.APP_ENV === 'development') {
        return res.status(500).send(err.toString());
    }
    return res.status(500).send('There was an error');
};

export default errorHandler;

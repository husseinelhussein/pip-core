import * as cors from 'cors';

const developmentOrigins = ['http://localhost:4200'];
const productionOrigins = [''];

const corsMiddleware = cors({
    origin: process.env.NODE_ENV === 'development' ? developmentOrigins : productionOrigins,
    credentials: true,
});

export default corsMiddleware;

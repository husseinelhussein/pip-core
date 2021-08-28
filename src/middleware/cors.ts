import * as cors from 'cors';

const developmentOrigins = ['http://localhost:4200', 'http://crmgjs-dev.dvly.site'];
const productionOrigins = ['http://crmgjs-dev.dvly.site'];

const corsMiddleware = cors({
    origin: process.env.NODE_ENV === 'development' ? developmentOrigins : productionOrigins,
    credentials: true,
});

export default corsMiddleware;

import express from 'express';
import cors from 'cors';
import expressJwt from 'express-jwt';
const PORT = 4000;

const {JWT_SECRET = 'secret'} = process.env;

const app = express();

app.use(cors());
app.use(expressJwt({secret: JWT_SECRET}).unless({path: ['*']}));

app.listen(PORT, () => console.log(`Server is up at ${PORT}`));
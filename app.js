require('dotenv').config()
require('express-async-errors')
//express
const express = require('express')
const app = express();

//other packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')

//database
const connectDB = require('./db/connect')

//middleware import
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

//routes import
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')

//middlewares
app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(cors())


//routes
app.get('/', (req, res) => {
    res.send('e-commerce api');
})

app.get('/api/v1', (req, res) => {
    console.log(req.signedCookies)
    res.send('e-commerce api');
})

app.use('/api/v1/auth', authRouter)

app.use('/api/v1/users', userRouter)


//error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const port = process.env.PORT || 5000;


const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => console.log(`listening on port: ${port}...`))
    } catch (e) {
        console.log(e)
    }
}

start();

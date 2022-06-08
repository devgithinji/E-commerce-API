require('dotenv').config()
require('express-async-errors')
//express
const express = require('express')
const app = express();

//other packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

//security packages
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitise = require('express-mongo-sanitize')

//database
const connectDB = require('./db/connect')

//middleware import
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

//routes import
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewsRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')


app.set('trust proxy', 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 60
    })
)

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitise())

//middlewares
//app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(cors())

app.use(express.static('./public'));
app.use(fileUpload())


//routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewsRouter)
app.use('/api/v1/orders', orderRouter)

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

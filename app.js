const express = require("express")
const mysql = require("mysql")
const app = express()
const dotenv = require('dotenv')
const path = require('path')
const cookieParser = require('cookie-parser')

//dotenv gets .env file from root directory
dotenv.config({ path: './.env' })

//Database connections are held in .env, declaration of variables example: DATABASE_USER = Tom
const userDB = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD, 
    database: process.env.DATABASE
})

const publicDirectory = path.join(__dirname, './public')

app.use(express.static(publicDirectory))

app.use(express.urlencoded({ extended: false }))

//parse JSON
app.use(express.json())

app.use(cookieParser())

app.set('view engine', 'hbs')

userDB.connect((error) => {
    if (error) {
        console.log(error) //Provide error if connection was not successful to database
    }
    else
        console.log("MySQL connecting .... OK") //Message to determine successful connection to database
})

//Define routes
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))

app.listen(5005, () => {
    console.log("Server started on localhost port 5005 .... OK")
})
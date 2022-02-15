const express = require("express")
const mysql = require("mysql")
const app = express()
const dotenv = require('dotenv')
const path = require('path')
const cookieParser = require('cookie-parser')

dotenv.config({ path: './.env' })

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
        console.log(error)
    }
    else
        console.log("MySQL connected...")
})

//Define routes
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))


app.listen(5005, () => {
    console.log("Server started on port 5005")
})
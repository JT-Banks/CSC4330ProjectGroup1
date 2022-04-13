const mysql = require("mysql")//import mysql
const jwt = require('jsonwebtoken') //Used to create, sign, and verify tokens
const bcrypt = require('bcryptjs') //Used for hashing passwords
const { promisify } = require('util') //Allows for async/await to work with promises
const async = require("hbs/lib/async") //hbs async helper

//Database connections are held in .env, declaration of variables example: DATABASE_USER = root
const userDB = mysql.createConnection({
<<<<<<< HEAD
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
=======
    host: process.env.DATABASE_HOST, 
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD, 
    database: process.env.DATABASE 
>>>>>>> bd5bb6d3c199a7e334a95866535c97b6f345f7b2
})

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body //users login with email & password 

        //if not false, email is true, !email = true
        if (!email || !password) {
            return res.status(400).render('login', { //keep rendering login until successful
                message: 'Please provide an email and password'
            })
        }
        userDB.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            //Provides input from user with hashed password for debugging. Can see ID, name and email. Password is already hashed here if exists
            console.log("This is the resulting object coming in via query to DB: \n" + results)
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Email or password is incorrect' //careful not to tell user which is incorrect
                })
            }
            //TODO: Fix login feature to properly work. Currently with DB changes, login feature is not working. :(
            else {
<<<<<<< HEAD
                const id = results[0].user_id //Grab first result
                console.log("This is the id: " + id + " and this is the password: " + results[0].password)
=======
                const id = results[0].id //Grab first result
                console.log("This is the id: -- " + id + "--")
>>>>>>> bd5bb6d3c199a7e334a95866535c97b6f345f7b2
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })
                console.log("This is the token: " + token) //Needed currently to verify secrets are generating correctly

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //convert to miliseconds, cookie expires in 4 hours
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions)
                //Redirects user to homepage when logged in
                res.status(200).redirect("/") //root
            }
        })
    }
    catch (error) {
        console.log("This is the error occured in login: " + error)
    }
}

exports.register = (req, res) => {
    console.log(req.body) //Debug purposes
    const { name, email, password, passwordConfirm } = req.body

    userDB.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error)
        }
        if (result.length > 0) {
            return res.render('register', {
                message: 'That is email is already in use!'
            })
        }
        else if (password === '') {
            return res.render('register', {
                message: 'Password field cannot be blank!'
            })
        }
        else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Your password and confirm password do not match!'
            })
        }
        //Attempting to implement logic to check for @columbus.edu email
        else if (!email.includes('@columbus.edu')) {
            console.log("Invalid email entered from user: " + email)
            return res.render('register', {
                message: "You can only register for this site using a columbus.edu email!"
            })
        }      

        let hashedPassword = await bcrypt.hash(password, 8) //hashing password
        
        console.log(hashedPassword)

        userDB.query('INSERT INTO users SET ? ', { name: name, email: email, password: hashedPassword }, (error, results) => {
<<<<<<< HEAD
=======
            console.log("This is object inserted into DB: " + results)
>>>>>>> bd5bb6d3c199a7e334a95866535c97b6f345f7b2
            if (error) {
                console.log(error)
            }
            else {
                console.log(results)
                return res.render('register', {
                    message: 'User registered!'
                })
            }
        })

    })

}

exports.isLoggedIn = async (req, res, next) => {
    req.message = "Inside middleware"
    console.log(req.cookies)
    if (req.cookies.jwt) {
        try {
            //Step 1: Verify Token
            const decoded = await promisify(jwt.verify)
                (req.cookies.jwt, process.env.JWT_SECRET)
            console.log(decoded)

            //Step 2: Check if user still exists
            userDB.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result)
                if (!result) {
                    return next()
                }
                req.user = result[0]
                return next()
            })
            //Step 3: Retrieve products, [basic logic to query products table, needs further work]
<<<<<<< HEAD
            //     userDB.query('SELECT * FROM products', (error, result) => {
            //         console.log(result)
            //         if (!result) {
            //             return next()
            //         }
            //         req.products = result[product.id].product_name
            //         return next()
            //     })
=======
            // userDB.query('SELECT * FROM products', (error, result) => {
            //     console.log(result)
            //     if (!result) {
            //         return next()
            //     }
            //     req.products = result[product.id].product_name
            //     return next()
            // })
>>>>>>> bd5bb6d3c199a7e334a95866535c97b6f345f7b2
        }
        catch (error) {
            console.log(error)
            return next()
        }
    } else { next() }
}

exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    })
    res.status(200).redirect('/')
}
<<<<<<< HEAD
=======

>>>>>>> bd5bb6d3c199a7e334a95866535c97b6f345f7b2

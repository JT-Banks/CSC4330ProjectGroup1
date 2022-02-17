const mysql = require("mysql")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { promisify } = require('util')

//Database connections are held in .env, declaration of variables example: DATABASE_USER = Tom
const userDB = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
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
            console.log(results) //Provides input from user with hashed password for debugging. Can see ID, name and email. Password is already hashed here if exists
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Email or password is incorrect' //careful not to tell user which is incorrect
                })
            }
            else {
                const id = results[0].id //Grab first result
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
        console.log(error)
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
        else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Your password and confirm password do not match!'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8)
        console.log(hashedPassword)
        userDB.query('INSERT INTO users SET ? ', { name: name, email: email, password: hashedPassword }, (error, results) => {
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
    //console.log(req.cookies)
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
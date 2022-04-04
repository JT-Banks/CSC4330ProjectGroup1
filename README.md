# CSC4330ProjectGroup1

React application to provide the following features:
- Login page
- Profile page
- Register page
- Product page (to be implemented)
- Shopping cart (to be implemented)
- Cookies(Session token)
- Logout functionality

Steps to run locally: 

**Make sure you have the following applications installed and configured:**
- [***Xampp for Windows and Linux***](https://www.apachefriends.org/download.html)
- [***Mamp for Mac***](https://www.mamp.info/en/downloads/) \
Example of Xampp on Windows: \
![image](https://user-images.githubusercontent.com/48796307/161466548-f88cf614-1cd7-4f29-9424-8fce031faf5e.png) \

1. Clone Repo
2. In terminal in directory of login_service: ``npm install``
3. Once installation is finished: ``npm start``
4. In select browser: ``localhost:5005``
5. .env file configuration: Database info, such as password, host, jwt cookie configs(this is meant to be private, up to you really) \
Here's an example: \
![image](https://user-images.githubusercontent.com/48796307/161466329-9d5b3825-1f78-4984-8305-f2c84b0f90b5.png)


Database setup: 
1. Once Xampp or Mamp is installed, navigate to ``http://localhost/phpmyadmin/index.php``
2. Click new -> Create database, name it ``login_service``
3. Create a table with the following SQL\
CREATE TABLE `users`(\
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\
    `name` VARCHAR(255) NOT NULL,\
    `email` VARCHAR(255) NOT NULL,\
    `password` VARCHAR(255) NOT NULL,\
    PRIMARY KEY(`id`)\
) ENGINE = INNODB;

Tech stack:
- Xampp (MySQL, and Apache)
- Handle-bars
- React
- Express
- Cookie Parser
- dotenv

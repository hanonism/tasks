const { log } = require('console');
const express = require('express');
const morgan = require('morgan');
const path = require('path');

let app = express();
let port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public_html'))
app.use(morgan('common'));
app.use(express.urlencoded({ extended: false}));

app.get('/setup', (req, res, next) => {
    res.render('setupform', {title: 'Onism | Set up'});
});

app.get('/login', (req, res, next) => {
    res.render('loginform', {title: 'Onism | Log in'});
});



// encode pin and store to different databases
app.post('/membersetup', (req, res, next) => {
    let email = req.body.email;
    let pin = req.body.pin;

    res.render('setupresponse', {
        title: 'Onism | Set up'
    });
    
    let code0 = String(Math.floor(Math.random() * 100));
    let code1 = String(Math.floor(Math.random() * 100));
    let code2 = String(Math.floor(Math.random() * 100));
    let code3 = String(Math.floor(Math.random() * 100));
    let code4 = String(Math.floor(Math.random() * 100));
    let code5 = String(Math.floor(Math.random() * 1000));
    let code6 = String(Math.floor(Math.random() * 1000));
    let code7 = String(Math.floor(Math.random() * 1000));
    let code8 = String(Math.floor(Math.random() * 1000));
    let code9 = String(Math.floor(Math.random() * 1000));

    let pinCode = "";
    for (let i = 0; i < pin.length; i++) {
        let code = "";
        switch (pin[i]) {
            case "0":
                code = code0;
                break;
            case "1":
                code = code1;
                break;
            case "2":
                code = code2;
                break;
            case "3":
                code = code3;
                break;
            case "4":
                code = code4;
                break;
            case "5":
                code = code5;
                break;
            case "6":
                code = code6;
                break;
            case "7":
                code = code7;
                break;
            case "8":
                code = code8;
                break;
            case "9":
                code = code9;
                break;
        }
        pinCode += code;
    };

    console.log('regis email: ', email);
    console.log('regis pin: ', pin);
    console.log('regis pinCode: ', pinCode);
    console.log();


    let sqlite3 = require('sqlite3').verbose();
    let keyDB = new sqlite3.Database('db/keyDB');
    let lockDB = new sqlite3.Database('db/lockDB');

    // let keyDB = new sqlite3.Database('keyDB');
    // let lockDB = new sqlite3.Database('lockDB');

    keyDB.serialize( () => {
        keyDB.run(`INSERT INTO Keys (email, code0, code1, code2, code3, code4, code5, code6, code7, code8, code9) VALUES ('${email}', '${code0}', '${code1}', '${code2}', '${code3}', '${code4}', '${code5}', '${code6}', '${code7}', '${code8}', '${code9}')`);

        keyDB.each("SELECT * FROM Keys", function(err, row) {
            if (err) {
                return console.err(err.message);
            } else {
                console.log(`${row.email}, ${row.code0}, ${row.code1}, ${row.code2}, ${row.code3}, ${code4}, ${row.code5}, ${row.code6}, ${row.code7}, ${row.code8}, ${code9}`);
            }
        });
    });
    keyDB.close();

    lockDB.serialize( () => {
        lockDB.run(`INSERT INTO Locks (email, pincode) VALUES ('${email}', '${pinCode}')`);
        lockDB.each("SELECT * FROM Locks", function(err, row) {
            if (err) {
                return console.err(err.message);
            } else {
                console.log(`${row.email}, ${row.pincode}`);
            }
        });
    });
    lockDB.close();
});



// check member login
app.post('/memberlogin', (req, res, next) => {
    let email = req.body.email;
    let pin = req.body.pin;

    let sqlite3 = require('sqlite3').verbose();
    let keyDB = new sqlite3.Database('db/keyDB');
    let lockDB = new sqlite3.Database('db/lockDB');

    // let keyDB = new sqlite3.Database('keyDB');
    // let lockDB = new sqlite3.Database('lockDB');

    let loginPin = "";
    let pinCode = "";
    let response = "";

    for (let i = 0; i < pin.length; i++) {
        keyDB.serialize( () => {
            keyDB.get(`SELECT * FROM Keys WHERE email = '${email}'`, (err, row) => {
                if(err) {
                    return console.error(err.message);
                } else {
                    let code = row[`code${pin[i]}`];
                    loginPin += code;
                    console.log(`code${i}: `, code);
                    console.log('loginPin inside: ', loginPin);
                }
            });
        });
    };
    keyDB.close();


    // let loginPin = "";
    // function fetchCode(i) {
    //     return new Promise((resolve, reject) => {
    //         keyDB.get(`SELECT * FROM Keys WHERE email = '${email}'`, (err, row) => {
    //             if(err) {
    //                 return reject(err);
    //             }
    //             if (row) {
    //                 let code = row[`code${i}`];
    //                 loginPin += code;
    //                 console.log('loginPin inside fetchCode:', loginPin);
    //             } else {
    //                 resolve(null);
    //             }
                
    //         });
    //     });
    // }

    // async function fetchAllCodes() {
    //     const promise = [];
    //     for (let i = 0; i < pin.length; i++) {
    //         promise.push(fetchCode(i));
    //         console.log('promise: ', promise);
    //     }
    //     await Promise.all(promise);
    //     console.log('loginPin inside: ', loginPin);
    //     keyDB.close();
    // }

    // fetchAllCodes();



    lockDB.each(`SELECT * FROM Locks WHERE email = '${email}'`, (err, row) => {
        if (err) {
            return console.error(err.message);
        } else {          
            pinCode = row.pincode;
            console.log('pincode inside: ', pinCode);
            console.log();
        }
    });
    lockDB.close();        

    console.log('loginPin outside: ' + loginPin);
    console.log('pincode outside: ', pinCode);
    console.log();

    if (loginPin === pinCode) {
        response = '<p>Log in successful.</p>';
    } else {
        response = 'Please check you <strong>Email</strong> or <strong>Pin</strong> again.';
    }

    res.render('loginresponse', {
        title: 'Onism | Login',
        response: response
    })

});

app.listen(port, () => {
    console.log(`Web server running at: http//localhost:${port}`);
    console.log(`Type Ctrl + C to shut down the web server`);
});
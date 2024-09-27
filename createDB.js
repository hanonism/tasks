let sqlite3 = require('sqlite3').verbose();
let keyDB = new sqlite3.Database('keyDB');
let lockDB = new sqlite3.Database('lockDB');

keyDB.serialize( function() {  
    keyDB.run('CREATE TABLE IF NOT EXISTS Keys (email TEXT PRIMARY KEY, code0 TEXT, code1 TEXT, code2 TEXT, code3 TEXT, code4 TEXT, code5 TEXT, code6 TEXT, code7 TEXT, code8 TEXT, code9 TEXT)');
    keyDB.run('DELETE FROM Keys');
});
keyDB.close();

lockDB.serialize( function() {  
    lockDB.run('CREATE TABLE IF NOT EXISTS Locks (email TEXT PRIMARY KEY, pincode TEXT)');
    lockDB.run('DELETE FROM Locks');
});
lockDB.close();
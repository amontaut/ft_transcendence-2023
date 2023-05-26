const postgres = require("pg");
require('dotenv').config()

// const db = require('db')
// db.connect({
//   host: process.env.POSTGRES_IP,
//   username: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD
// })
// console.log(process.env.POSTGRES_USER)

async function retreiveConnectionSQL() {
    const dataBase = new postgres.Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_IP,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });
    await dataBase.connect();

    //await dataBase.query(`DROP TABLE IF EXISTS "sessions";`) 
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "sessions" (
        "session" CHAR(50) NOT NULL,
        "id" INTEGER NOT NULL
    );`)
    // CwOUU5KNWTSfbWiauLDJ1CH88NSjJ1xMEMXOEDbiFpfX9Y3pyi
    //await dataBase.query(`INSERT INTO "sessions" ("session", id) VALUES ($1, $2);`, ["iauACIgx5eTxOYg2F9OejWd1DQsRBCmAb3D0DURJ1BP3opsX05", 79137])
    //await dataBase.query(`INSERT INTO "sessions" ("session", id) VALUES ($1, $2);`, ["CwOUU5KNWTSfbWiauLDJ1CH88NSjJ1xMEMXOEDbiFpfX9Y3pyi", 63436])
    //await dataBase.query(`INSERT INTO "sessions" ("session", id) VALUES ($1, $2);`, ["4vjKTYXZ22w1V1jZL5w17sVRvBotx5TZv6rpihA3F3B7Vapvnm", 91471])
    //await dataBase.query(`DROP TABLE IF EXISTS "users";`) 
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER NOT NULL,
        "register" BOOLEAN NOT NULL,
        "nick" VARCHAR(50) NOT NULL,
        "friends" TEXT NOT NULL DEFAULT '{}',
        "auth" TEXT NULL,
        "blocked" TEXT NOT NULL DEFAULT '{}'
    );`)

    //await dataBase.query(`DROP TABLE IF EXISTS "history";`)
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "history" (
        "id" INTEGER NOT NULL,
        "win" BOOLEAN NOT NULL,
        "date" BIGINT NOT NULL,
        "ennemy" INTEGER NOT NULL,
        "score" INTEGER NOT NULL,
        "ennemyScore" INTEGER NOT NULL
    );`)
   
    //await dataBase.query(`INSERT INTO "users" ("id", "register", "nick") VALUES ($1, $2, $3);`, [79137, true, "Mouloud"]);
    //await dataBase.query(`INSERT INTO "users" ("id", "register", "nick") VALUES ($1, $2, $3);`, [63436, true, "Martin"]);
    //await dataBase.query(`INSERT INTO "users" ("id", "register", "nick") VALUES ($1, $2, $3);`, [91471, true, "Alexis"]);
    //await dataBase.query(`INSERT INTO "users" ("id", "register", "nick") VALUES ($1, $2, $3);`, [77506, true, "Alice"]);

    //await dataBase.query(`DROP TABLE IF EXISTS "channels";`)
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "channels" (
        "id" INTEGER NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "owner" INTEGER NOT NULL,
        "users" TEXT NOT NULL DEFAULT '{}',
        "password" TEXT NOT NULL DEFAULT '',
        "type" SMALLINT NOT NULL,
        "invite" VARCHAR(50) NOT NULL
    );`)

    //await dataBase.query(`DROP TABLE IF EXISTS "messages";`)
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "messages" (
        "id" INTEGER NOT NULL,
        "channel" INTEGER NOT NULL,
        "author" INTEGER NOT NULL,
        "nick" VARCHAR(50) NOT NULL,
        "content" TEXT NOT NULL,
        "date" BIGINT NOT NULL
    );`)
    //await dataBase.query(`INSERT INTO "channels" ("id", "name", "owner", "type") VALUES ($1, $2, $3, $4);`, [1, "Waw", 79137, 1]);
    return dataBase;
}

let isFetching = false;
let dataBase;
async function retreiveDataBase() {
    if (!dataBase && !isFetching) {
        isFetching = true;
        return new Promise(async (resolve, reject) => {
            try {
                dataBase = await retreiveConnectionSQL();
                resolve(dataBase);
            } catch (error) {
                reject(error);
            }
        });
    } else if (dataBase) {
        return dataBase;
    } else {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (dataBase) {
                    clearInterval(interval);
                    resolve(dataBase);
                }
            }, 100);
        });
    }
}

export { retreiveDataBase }
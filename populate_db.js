require('dotenv').config();

db = Mongo(process.env.DB_CONNECTION_STRING).getDB('stockpikr');


db.users.drop();
db.users.insertMany([
    {
        userID: "000000000000000000001",
        firstName: "fName1",
        lastName: "lName2",
        address: "1234 Address St.",
        phoneNumber: "1234567890",
    },
    {
        userID: "000000000000000000002",
        firstName: "fName2",
        lastName: "lName2",
        address: "4321 Address St.",
        phoneNumber: "9876543210",
    }
]);

db.watchlists.drop();
db.watchlists.insertMany([
    {
        watchlistID: "000000000000000000001",
        userID: "000000000000000000001",
        tickers: [
            "AAPL",
            "MSFT",
            "GOOG",
            "AMZN",
            "TSLA"
        ]
    },
    {
        watchlistID: "000000000000000000002",
        userID: "000000000000000000002",
        tickers: [
            "RYTM",
            "EXTR",
            "AVDX",
            "BEAM"
        ]
    }
]);


console.log("Database populated successfully!")
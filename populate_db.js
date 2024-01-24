require("dotenv").config();

db = Mongo(process.env.DB_CONNECTION_STRING).getDB("stockpikr");

db.users.drop();
db.users.insertMany([
  {
    authID: "temp_google_ouath_id_1",
    userID: "000000000000000000001",
    firstName: "fName1",
    lastName: "lName2",
    email: "temp1@email.com",
    phoneNumber: "1234567890"
  },
  {
    authID: "temp_google_ouath_id_2",
    userID: "000000000000000000002",
    firstName: "fName2",
    lastName: "lName2",
    email: "temp2@email.com",
    phoneNumber: "9876543210"
  }
]);

db.watchlists.drop();
db.watchlists.insertMany([
  {
    watchlistID: "000000000000000000001",
    userID: "000000000000000000001",
    tickers: ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA"]
  },
  {
    watchlistID: "000000000000000000002",
    userID: "000000000000000000001",
    tickers: ["RYTM", "EXTR", "AVDX", "BEAM"]
  },
  {
    watchlistID: "000000000000000000002",
    userID: "000000000000000000002",
    tickers: ["NFLX", "FB", "NVDA", "PYPL", "SQ"]
  },
  {
    watchlistID: "000000000000000000003",
    userID: "000000000000000000001",
    tickers: ["IBM", "INTC", "CSCO", "ORCL", "HPQ"]
  },
  {
    watchlistID: "000000000000000000004",
    userID: "000000000000000000002",
    tickers: ["V", "MA", "AXP", "DFS", "COF"]
  },
  {
    watchlistID: "000000000000000000005",
    userID: "000000000000000000002",
    tickers: ["DIS", "CMCSA", "NFLX", "AMCX", "LGF"]
  },
  {
    watchlistID: "000000000000000000006",
    userID: "000000000000000000001",
    tickers: ["BA", "LMT", "RTX", "GD", "NOC"]
  },
  {
    watchlistID: "000000000000000000007",
    userID: "000000000000000000002",
    tickers: ["JPM", "BAC", "C", "WFC", "GS"]
  }
]);

console.log("Database populated successfully!");

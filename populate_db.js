require('dotenv').config();

db = Mongo(process.env.DB_CONNECTION_STRING).getDB('stockpikr');

db.createUser(
    {
        user: "dbAdmin",
        pwd: "test",
        roles: ["readWrite", "dbAdmin"]
    }
)

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

console.log("Database populated successfully!")
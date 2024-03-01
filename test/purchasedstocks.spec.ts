import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { PurchasedStockModel } from "../models/PurchasedStockModel";
import { initServer } from "../server";

// Configure chai
chai.use(sinonChai);
const expect = chai.expect;
const sandbox = sinon.createSandbox();
const userID = "000000000000000000001";
const watchlistID = "000000000000000000001";

const purchasedStock = {
  watchlistID: "000000000000000000001",
  userID: "000000000000000000001",
  ticker: "RTX",
  purchaseDate: "2024-01-27T12:00:00.000Z",
  purchasePrice: 150.5,
  volume: 100,
  nearLow: 145.0,
  nearHigh: 155.0
};

let mongoServer: MongoMemoryServer;

describe("test-purchasedstocks-apis-by-user-id", () => {
  var results;

  let purchasedStocks: PurchasedStockModel;
  let server: App;

  beforeEach(() => {
    sandbox.restore();
  });

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    purchasedStocks = new PurchasedStockModel(mongoose.connection);
    server = initServer({ purchasedStockModel: purchasedStocks });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  before((done) => {
    sandbox.restore();
    sandbox.stub(purchasedStocks, "getPurchasedStocksByUserID").resolves([purchasedStock as any]);
    supertest
      .agent(server)
      .get("/api/purchasedstocks/user/" + userID)
      .end((err, res) => {
        results = res.body;
        expect(res).to.have.status(200);
        done();
      });
  });

  // it("should return an array of purchased stocks", (done) => {
  //   expect(results).to.be.an("array");
  //   done();
  // });

  // it("should return an array with the first entry equal to the test script data", (done) => {
  //   expect(results[0].userID).to.be.equal(purchasedStock.userID);
  //   expect(results[0].ticker).to.be.equal(purchasedStock.ticker);
  //   expect(results[0].purchaseDate).to.be.equal(purchasedStock.purchaseDate);
  //   expect(results[0].purchasePrice).to.be.equal(purchasedStock.purchasePrice);
  //   done();
  // });
});

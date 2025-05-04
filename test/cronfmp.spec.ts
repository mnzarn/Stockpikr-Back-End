import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { UserModel } from "../models/UserModel";
import { WatchlistModel } from "../models/WatchlistModel";
import { initServer } from "../server";
import { CronFmp } from "../services/cronFmp";
import { StockApiService } from "../services/fmpApi";
import { getCurrentTimestampSeconds } from "../utils";

chai.use(sinonChai);
const expect = chai.expect;
const tickers = ["FAKE_TICKER", "FAKE_TICKER_2"];
const sandbox = sinon.createSandbox();

const now = getCurrentTimestampSeconds();

const stockInfos = tickers.map((ticker) => ({
  symbol: ticker,
  name: "FAKE_TICKER Inc.",
  price: 145.775,
  changesPercentage: 0.32,
  change: 0.465,
  dayLow: 143.9,
  dayHigh: 146.71,
  yearHigh: 179.61,
  yearLow: 124.17,
  marketCap: 2306437439846,
  priceAvg50: 140.8724,
  priceAvg200: 147.18594,
  exchange: "NASDAQ",
  volume: 42478176,
  avgVolume: 73638864,
  open: 144.38,
  previousClose: 145.31,
  eps: 5.89,
  pe: 24.75,
  earningsAnnouncement: new Date("2023-04-26T10:59:00.000+0000"),
  sharesOutstanding: 15821899776,
  storedTimestamp: now,
  timestamp: 1677790773
}));

let mongoServer: MongoMemoryServer;

describe("test-cronfmp", () => {
  let server: App;
  let latestStocks: LatestStockInfoModel;
  let userModel: UserModel;
  let watchlistModel: WatchlistModel;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    latestStocks = new LatestStockInfoModel(mongoose.connection);
    userModel = new UserModel(mongoose.connection);
    watchlistModel = new WatchlistModel(mongoose.connection);
    server = initServer({ latestStockInfoModel: latestStocks });
  });

  beforeEach(async () => {
    sandbox.restore();
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should bulk add new tickers when DB is empty", async () => {
    sandbox.stub(StockApiService, "fetchExchangeSymbols").resolves(stockInfos as any);
    const cronFmp = new CronFmp(latestStocks, userModel, watchlistModel);
    await cronFmp.fetchOrUpdateLatestStocks();

    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    expect(res.body).to.be.an("array").with.length(2);
    expect(res.body[0].symbol).eq(tickers[0]);
  });

  it("should not update tickers if storedTimestamp is within 1 day", async () => {
    // Insert data first
    sandbox.stub(StockApiService, "fetchExchangeSymbols").resolves(stockInfos as any);
    const cronFmp1 = new CronFmp(latestStocks, userModel, watchlistModel);
    await cronFmp1.fetchOrUpdateLatestStocks();
    sandbox.restore();

    // Change response to new symbols, but timestamp is still "fresh"
    sandbox.stub(StockApiService, "fetchExchangeSymbols")
      .resolves(stockInfos.map((s) => ({ ...s, symbol: "FAKE_TICKER_3" })));

    const cronFmp2 = new CronFmp(latestStocks, userModel, watchlistModel);
    await cronFmp2.fetchOrUpdateLatestStocks();

    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    expect(res.body).to.be.an("array").with.length(2);
    expect(res.body[0].symbol).eq(tickers[0]);
  });

  it("should update data when storedTimestamp is older than 1 day", async () => {
    await latestStocks.addBulkTickers(stockInfos);

    const newSymbol = "FAKE_TICKER_3";
    const newStockInfos = [
      { ...stockInfos[0], symbol: newSymbol },
      { ...stockInfos[0], price: 100 }, // updated
      stockInfos[1]
    ];

    sandbox.stub(StockApiService, "fetchExchangeSymbols").resolves(newStockInfos);

    // Use overrideNow to simulate old data
    const oneDayAgo = now - (60 * 60 * 24 + 1);
    const cronFmp = new CronFmp(latestStocks, userModel, watchlistModel, oneDayAgo);
    await cronFmp.fetchOrUpdateLatestStocks();

    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    expect(res.body).to.be.an("array").with.length(3);
    expect(res.body.find((s: any) => s.symbol === newSymbol)).to.exist;
    expect(res.body.find((s: any) => s.price === 100)).to.exist;
  });
});

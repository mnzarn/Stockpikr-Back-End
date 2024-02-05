import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
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

  beforeEach(() => {
    sandbox.restore();
  });

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    latestStocks = new LatestStockInfoModel(mongoose.connection);
    server = initServer({ latestStockInfoModel: latestStocks });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("test cron fmp empty db should bulk add new tickers", async () => {
    // fixture, mock fmp api to return our wanted api
    sandbox.stub(StockApiService, "fetchExchangeSymbols").resolves(stockInfos as any);
    const cronFmp = new CronFmp(latestStocks);
    await cronFmp.fetchOrUpdateLatestStocks();

    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    console.log(res.body);
    expect(res.body).to.be.an("array");
    expect(res.body.length).eq(2);
    expect(res.body[0].symbol).eq(tickers[0]);
  });

  it("test cron fmp already have data but no update because storedTimestamp within 1 day", async () => {
    // fixture, mock fmp api to return our wanted api
    sandbox.stub(StockApiService, "fetchExchangeSymbols").resolves(stockInfos);
    const cronFmp = new CronFmp(latestStocks);
    await cronFmp.fetchOrUpdateLatestStocks();
    sandbox.restore();

    // action. Call fetchOrUpdateLatestStocks again, which will not update new stocks
    sandbox
      .stub(StockApiService, "fetchExchangeSymbols")
      .resolves(stockInfos.map((info) => ({ ...info, symbol: "FAKE_TICKER_3" })));
    await cronFmp.fetchOrUpdateLatestStocks();
    // should stay the same
    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    console.log(res.body);
    expect(res.body).to.be.an("array");
    expect(res.body.length).eq(2);
    expect(res.body[0].symbol).eq(tickers[0]);
  });

  it("test cron fmp update data when storedTimestamp > 1 day", async () => {
    // fixture, mock fmp api to return our wanted api
    await latestStocks.addBulkTickers(stockInfos);
    const newSymbol = "FAKE_TICKER_3";
    // add a new ticker by using a new symbol while updating one and keep one the same
    const newStockInfos = [{ ...stockInfos[0], symbol: newSymbol }, { ...stockInfos[0], price: 100 }, stockInfos[1]];
    const cronFmp = new CronFmp(latestStocks, 1607110244); // Friday, December 4, 2020. Should update new batch

    // action. Call fetchOrUpdateLatestStocks again, which will update new stocks & data
    sandbox.stub(StockApiService, "fetchExchangeSymbols").resolves(newStockInfos);
    await cronFmp.fetchOrUpdateLatestStocks();
    // should stay the same
    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    console.log(res.body);
    expect(res.body).to.be.an("array");
    expect(res.body.length).eq(3);
    expect(res.body[0].symbol).eq(newSymbol);
    expect(res.body[1].price).eq(100);
    expect(res.body[2].symbol).eq(tickers[1]);
    expect(res.body[2].price).eq(145.775);
  });
});

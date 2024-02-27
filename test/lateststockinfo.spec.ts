import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { initServer } from "../server";
import { getCurrentTimestampSeconds } from "../utils";

chai.use(sinonChai);
const expect = chai.expect;
const sandbox = sinon.createSandbox();
const ticker = "FAKE_TICKER";

var originalStockInfo;

const stockInfo = {
  symbol: "FAKE_TICKER",
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
  timestamp: 1677790773
};

let mongoServer: MongoMemoryServer;

describe("test-lateststockinfo-apis-post", () => {
  let server: App;
  let latestStocks: LatestStockInfoModel;

  beforeEach(() => {
    sandbox.restore();
  });

  before(async () => {
    sandbox.restore();
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

  it("should add a new ticker", async () => {
    await supertest.agent(server).post("/api/lateststockinfo/").send(stockInfo);
    const res = await supertest.agent(server).get("/api/lateststockinfo/").send();
    expect(res.status).eq(200);
    console.log(res.body);
    expect(res.body).to.be.an("array");
    expect(res.body.length).eq(1);
    expect(res.body[0].symbol).eq(ticker);
    // clean up data after testing
    await latestStocks.deleteStockPriceInfoByTicker(ticker);
  });

  it("should search correct tickers", async () => {
    // fixture
    const tickers = ["FAKE_TICKER", "FAKE_TICKER_2", "foo bar"];
    const now = getCurrentTimestampSeconds();
    const stockInfos = tickers.map((ticker) => ({
      symbol: ticker,
      name: "COMPANY",
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
    await latestStocks.addBulkTickers(stockInfos);

    // testing. we search stock info based on input. We're using regex -> FAKE should include both FAKE_TICKER & FAKE_TICKER_2
    let result = await latestStocks.searchStockQuotes("FAKE");
    expect(result.length).to.eq(2);
    expect(result[0].symbol).to.eq(tickers[0]);
    expect(result[1].symbol).to.eq(tickers[1]);

    // by specifying exactly FAKE_TICKER_2, we get only FAKE_TICKER_2
    result = await latestStocks.searchStockQuotes("FAKE_TICKER_2");
    expect(result.length).to.eq(1);
    expect(result[0].symbol).to.eq(tickers[1]);

    // by specifying foo bar, we will only get foo bar
    result = await latestStocks.searchStockQuotes("foo bar");
    expect(result.length).to.eq(1);
    expect(result[0].symbol).to.eq(tickers[2]);

    // search by name, should also pass
    result = await latestStocks.searchStockQuotes("COMP");
    expect(result.length).to.eq(3);
    expect(result[0].name).to.eq("COMPANY");
  });
});

describe("test-lateststockinfo-apis-by-stock-ticker", () => {
  var result;
  let server: App;
  let connection = mongoose.connection;
  let latestStocks = new LatestStockInfoModel(connection);
  server = initServer({ latestStockInfoModel: latestStocks });

  before((done) => {
    sandbox.restore();
    sandbox.stub(latestStocks, "getLatestStockQuoteDetailed").resolves(stockInfo as any);
    supertest
      .agent(server)
      .get("/api/lateststockinfo/quote/" + ticker)
      .end((err, res) => {
        result = res.body;
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should return an entry equal to the test script data", (done) => {
    expect(result).to.be.an("object");
    console.log(result);
    expect(result.symbol).to.be.equal(stockInfo.symbol);
    expect(result.name).to.be.equal(stockInfo.name);
    expect(result.price).to.be.equal(stockInfo.price);
    expect(result.changesPercentage).to.be.equal(stockInfo.changesPercentage);
    expect(result.change).to.be.equal(stockInfo.change);
    expect(result.dayLow).to.be.equal(stockInfo.dayLow);
    expect(result.dayHigh).to.be.equal(stockInfo.dayHigh);
    expect(result.yearHigh).to.be.equal(stockInfo.yearHigh);
    expect(result.yearLow).to.be.equal(stockInfo.yearLow);
    expect(result.marketCap).to.be.equal(stockInfo.marketCap);
    expect(result.priceAvg50).to.be.equal(stockInfo.priceAvg50);
    expect(result.priceAvg200).to.be.equal(stockInfo.priceAvg200);
    expect(result.exchange).to.be.equal(stockInfo.exchange);
    expect(result.volume).to.be.equal(stockInfo.volume);
    expect(result.avgVolume).to.be.equal(stockInfo.avgVolume);
    expect(result.open).to.be.equal(stockInfo.open);
    expect(result.previousClose).to.be.equal(stockInfo.previousClose);
    expect(result.eps).to.be.equal(stockInfo.eps);
    expect(result.pe).to.be.equal(stockInfo.pe);
    expect(result.sharesOutstanding).to.be.equal(stockInfo.sharesOutstanding);
    expect(result.timestamp).to.be.equal(stockInfo.timestamp);
    done();
  });

  after((done) => {
    sandbox.restore();
    sandbox.stub(latestStocks, "deleteStockPriceInfoByTicker").resolves(stockInfo as any);
    supertest
      .agent(server)
      .delete("/api/lateststockinfo/" + ticker)
      .send(originalStockInfo)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

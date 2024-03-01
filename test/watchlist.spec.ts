import * as chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { MinimalWatchlistTicker } from "../interfaces/IWatchlistModel";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { WatchlistModel } from "../models/WatchlistModel";
import { initServer } from "../server";
import { ParamTest } from "./api-test-param-type";

// Configure chai
chai.use(sinonChai);
const expect = chai.expect;
const sandbox = sinon.createSandbox();
let mongoServer: MongoMemoryServer;

describe("test-watchlist-apis", () => {
  let server: App;
  let watchlistModel: WatchlistModel;
  let latestStockInfoModel: LatestStockInfoModel;

  beforeEach(() => {
    sandbox.restore();
  });

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    watchlistModel = new WatchlistModel(mongoose.connection);
    latestStockInfoModel = new LatestStockInfoModel(mongoose.connection);
    server = initServer({ watchlistModel, latestStockInfoModel });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const stockSymbol = "FAKE_TICKER";
  const basicWatchlist = {
    watchlistName: "My Watchlist",
    userID: "x",
    tickers: [] as MinimalWatchlistTicker[]
  };
  const advancedWatchlist = {
    watchlistName: "My Watchlist",
    userID: "x",
    tickers: [{ symbol: stockSymbol, alertPrice: 2 }] as MinimalWatchlistTicker[]
  } as any;
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
    storedTimestamp: 1677790773,
    timestamp: 1677790773
  };

  const getWatchlistsTcs: ParamTest[] = [
    [[basicWatchlist], 200, [basicWatchlist], false],
    [[], 404, { error: "Watchlists not found" }, false],
    [undefined, 500, { error: "Internal server error" }, true]
  ];

  getWatchlistsTcs.forEach((tc) => {
    it(`test get all watchlists with endpoint /api/watchlists should response status ${tc[1]}`, (done) => {
      // fixture, mock getWatchlists db call so we can evaluate the apis
      if (tc[3]) sandbox.stub(watchlistModel, "getWatchlists").throws();
      else sandbox.stub(watchlistModel, "getWatchlists").resolves(tc[0]);

      supertest
        .agent(server)
        .get("/api/watchlists")
        .expect(tc[1])
        .end(function (err, res) {
          if (err) {
            expect(err).to.deep.eq(tc[2]);
            done(err);
          } else {
            console.log("res: ", res.body);
            expect(res.body).to.deep.eq(tc[2]);
            done();
          }
        });
    });
  });

  const getWatchlistTcs: ParamTest[] = [
    [{ name: "My Watchlist", wl: basicWatchlist }, 200, basicWatchlist, false],
    [{ name: "foobar", wl: undefined }, 404, { error: "Watchlist not found" }, false],
    [{ name: "foobar", wl: undefined }, 500, { error: "Internal server error" }, true]
  ];

  getWatchlistTcs.forEach((tc) => {
    it(`test get watchlist by id with endpoint api/watchlists/:name should response status ${tc[1]}`, (done) => {
      // fixture, mock getWatchlists db call so we can evaluate the apis
      if (tc[3]) sandbox.stub(watchlistModel, "getWatchlist").throws();
      else sandbox.stub(watchlistModel, "getWatchlist").resolves(tc[0].wl);

      supertest
        .agent(server)
        .get(`/api/watchlists/${tc[0].name}?userId=foo`)
        .expect(tc[1])
        .end(function (err, res) {
          if (err) {
            expect(err).to.deep.eq(tc[2]);
            done(err);
          } else {
            console.log("res: ", res.body);
            expect(res.body).to.deep.eq(tc[2]);
            done();
          }
        });
    });
  });

  it(`test /api/watchlists with tickers should return watchlists with detailed tickers`, async () => {
    // fixture, mock getWatchlists db call so we can evaluate the apis
    await watchlistModel.addWatchlist(
      advancedWatchlist.userID,
      advancedWatchlist.watchlistName,
      advancedWatchlist.tickers
    );
    await latestStockInfoModel.addNewTickerInfo(stockInfo);

    // action
    const result = await supertest.agent(server).get(`/api/watchlists?userId=${advancedWatchlist.userID}`).send();
    // assert
    expect(result.status).to.eq(200);
    const watchlists = result.body;
    expect(watchlists.length).to.eq(1);
    expect(watchlists[0].watchlistName).to.eq(advancedWatchlist.watchlistName);
    expect(watchlists[0].userID).to.eq(advancedWatchlist.userID);
    const tickers = watchlists[0].tickers;
    expect(tickers.length).to.eq(1);
    expect(tickers[0].price).to.eq(stockInfo.price);
    expect(tickers[0].changesPercentage).to.eq(stockInfo.changesPercentage);

    // clean up
    await watchlistModel.deleteWatchlist(advancedWatchlist.watchlistName, advancedWatchlist.userID);
    await latestStockInfoModel.deleteStockPriceInfoByTicker(stockInfo.symbol);
  });

  it(`test /api/watchlists/user/:id with tickers should return watchlists with detailed tickers`, async () => {
    // fixture, mock getWatchlists db call so we can evaluate the apis
    await watchlistModel.addWatchlist(
      advancedWatchlist.userID,
      advancedWatchlist.watchlistName,
      advancedWatchlist.tickers
    );
    await latestStockInfoModel.addNewTickerInfo(stockInfo);

    // action
    const result = await supertest.agent(server).get(`/api/watchlists/user/${advancedWatchlist.userID}`).send();
    // assert
    expect(result.status).to.eq(200);
    const watchlists = result.body;
    expect(watchlists.length).to.eq(1);
    expect(watchlists[0].watchlistName).to.eq(advancedWatchlist.watchlistName);
    expect(watchlists[0].userID).to.eq(advancedWatchlist.userID);
    const tickers = watchlists[0].tickers;
    expect(tickers.length).to.eq(1);
    expect(tickers[0].price).to.eq(stockInfo.price);
    expect(tickers[0].changesPercentage).to.eq(stockInfo.changesPercentage);

    // clean up
    await watchlistModel.deleteWatchlist(advancedWatchlist.watchlistName, advancedWatchlist.userID);
    await latestStockInfoModel.deleteStockPriceInfoByTicker(stockInfo.symbol);
  });

  it(`test /api/watchlists/:name with tickers should return watchlist with detailed tickers`, async () => {
    // fixture, mock getWatchlists db call so we can evaluate the apis
    await watchlistModel.addWatchlist(
      advancedWatchlist.userID,
      advancedWatchlist.watchlistName,
      advancedWatchlist.tickers
    );
    await latestStockInfoModel.addNewTickerInfo(stockInfo);

    // action
    const result = await supertest.agent(server).get(`/api/watchlists/${advancedWatchlist.watchlistName}?userId=${advancedWatchlist.userID}`).send();
    // assert
    expect(result.status).to.eq(200);
    const watchlist = result.body;
    expect(watchlist.watchlistName).to.eq(advancedWatchlist.watchlistName);
    expect(watchlist.userID).to.eq(advancedWatchlist.userID);
    const tickers = watchlist.tickers;
    expect(tickers.length).to.eq(1);
    expect(tickers[0].price).to.eq(stockInfo.price);
    expect(tickers[0].changesPercentage).to.eq(stockInfo.changesPercentage);

    // clean up
    await watchlistModel.deleteWatchlist(advancedWatchlist.watchlistName, advancedWatchlist.userID);
    await latestStockInfoModel.deleteStockPriceInfoByTicker(stockInfo.symbol);
  });

  it("test-deleteTickersInWatchlist", async () => {
    // fixture
    const name = "wl name";
    const userId = "foobar";
    const tickers: MinimalWatchlistTicker[] = [
      { symbol: "foo", alertPrice: 1 },
      { symbol: "bar", alertPrice: 2 }
    ];
    await watchlistModel.addWatchlist(userId, name, tickers);
    const watchlist = await watchlistModel.getWatchlist(name, userId);
    console.log(watchlist);
    expect(watchlist.tickers.length).to.eq(2);
    expect(watchlist.tickers.map((t) => t.symbol)).to.deep.eq(["foo", "bar"]);

    // test
    await supertest.agent(server).patch(`/api/watchlists/tickers/${name}`).query({ userId }).send(["bar"]).expect(200);
    // assert
    const newWatchlist = await watchlistModel.getWatchlist(name, userId);
    expect(newWatchlist.tickers.length).to.equal(1);
    expect(newWatchlist.tickers[0].symbol).to.equal("foo");

    // clean up. delete old watchlists for other tests
    await watchlistModel.deleteWatchlist(name, userId);
  });

  it("test-update-watchlist-tickers", async () => {
    // fixture
    const name = "wl name";
    const userId = "foobar";
    const newTickerSymbol = "john";
    const tickers: MinimalWatchlistTicker[] = [
      { symbol: "foo", alertPrice: 1 },
      { symbol: "bar", alertPrice: 2 }
    ];
    await watchlistModel.addWatchlist(userId, name, tickers);
    const watchlist = await watchlistModel.getWatchlist(name, userId);
    console.log(watchlist);
    expect(watchlist.tickers.length).to.eq(2);
    expect(watchlist.tickers.map((t) => t.symbol)).to.deep.eq(["foo", "bar"]);

    // test
    // case 1: right now, we dont have anything in the lateststockinfo yet -> 404 not found when trying to add new tickers
    await supertest
      .agent(server)
      .put(`/api/watchlists/watchlist/${name}`)
      .query({ userId })
      .send({ symbol: 'unknown symbol', alertPrice: 1 } as MinimalWatchlistTicker)
      .expect(404);

    // case 2: we will mock the lateststockinfo data to return something, so we can test updating tickers
    sandbox.stub(latestStockInfoModel, "getLatestStockQuoteDetailed").resolves({} as any);

    // case 2.1: existing ticker with different alert price, should update
    await supertest
      .agent(server)
      .put(`/api/watchlists/watchlist/${name}`)
      .query({ userId })
      .send({ symbol: "bar", alertPrice: 3 } as MinimalWatchlistTicker)
      .expect(200);

    const { tickers: newTickers } = await watchlistModel.getWatchlistTickers(name, userId);
    expect(newTickers.length).to.eq(2);
    expect(newTickers.find((t) => t.symbol === "bar").alertPrice).to.eq(3);

    // case 2.2: one new ticker
    await supertest
      .agent(server)
      .put(`/api/watchlists/watchlist/${name}`)
      .query({ userId })
      .send({ symbol: newTickerSymbol, alertPrice: 10 } as MinimalWatchlistTicker)
      .expect(200);

    const { tickers: anotherNewTickers } = await watchlistModel.getWatchlistTickers(name, userId);
    expect(anotherNewTickers.length).to.eq(3);
    expect(anotherNewTickers.find((t) => t.symbol === newTickerSymbol).alertPrice).to.eq(10);

    // clean up data
    await watchlistModel.deleteWatchlist(name, userId);
  });

  it("test-getWatchlists-in-memory-mongo", async () => {
    const name = "wl name";
    const userId = "foobar";
    const tickers = [];
    await watchlistModel.addWatchlist(userId, name, tickers);
    const watchlists = await watchlistModel.getWatchlists();
    console.log("watchlists: ", watchlists);
    expect(watchlists.length).eq(1);
    expect(watchlists[0].watchlistName).eq(name);
    expect(watchlists[0].userID).eq(userId);
    expect(watchlists[0].tickers).deep.eq(tickers);
    // clean up
    await watchlistModel.deleteWatchlist(name, userId);
  });
});

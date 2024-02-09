import * as chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { Ticker } from "../interfaces/IWatchlistModel";
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

  beforeEach(() => {
    sandbox.restore();
  });

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    watchlistModel = new WatchlistModel(mongoose.connection);
    server = initServer({ watchlistModel });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const basicWatchlist = {
    watchlistName: "My Watchlist",
    userID: "x",
    tickers: []
  } as any;
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
        .get(`/api/watchlists/${tc[0].name}`)
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

  it("test-deleteTickersInWatchlist", async () => {
    // fixture
    const name = "wl name";
    const userId = "foobar";
    const tickers: Ticker[] = [
      { symbol: "foo", alertPrice: 1 },
      { symbol: "bar", alertPrice: 2 }
    ];
    await watchlistModel.addWatchlist(userId, name, tickers);
    const watchlist = await watchlistModel.getWatchlist(name);
    console.log(watchlist);
    expect(watchlist.tickers.length).to.eq(2);
    expect(watchlist.tickers.map((t) => t.symbol)).to.deep.eq(["foo", "bar"]);

    // test
    await supertest.agent(server).patch(`/api/watchlists/tickers/${name}`).query({ userId }).send(["bar"]).expect(200);
    // assert
    const newWatchlist = await watchlistModel.getWatchlist(name);
    expect(newWatchlist.tickers.length).to.equal(1);
    expect(newWatchlist.tickers[0].symbol).to.equal("foo");

    // clean up. delete old watchlists for other tests
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

import * as chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import { App } from "supertest/types";
import { Watchlists } from "../routes/watchlists";
import { initServer } from "../server";
import { ParamTest } from "./api-test-param-type";
// Configure chai
chai.use(sinonChai);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe("test-watchlist-apis", () => {
  let server: App;
  server = initServer();
  beforeEach(() => {
    // forcefully restore sandbox to allow re-write of findOneStub
    sandbox.restore();
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
      if (tc[3]) sandbox.stub(Watchlists, "getWatchlists").throws();
      else sandbox.stub(Watchlists, "getWatchlists").resolves(tc[0]);

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
      if (tc[3]) sandbox.stub(Watchlists, "getWatchlist").throws();
      else sandbox.stub(Watchlists, "getWatchlist").resolves(tc[0].wl);

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
});

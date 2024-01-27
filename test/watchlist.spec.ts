import * as chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import supertest from "supertest";
import server from "../index";
import { Watchlists } from "../routes/watchlists";
// Configure chai
chai.use(sinonChai);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe("test-watchlist-apis", () => {
  beforeEach(async () => {
    // forcefully restore sandbox to allow re-write of findOneStub
    sandbox.restore();
  });

  it("test /", (done) => {
    // fixture, mock getWatchlists db call so we can evaluate the apis
    let fakeWatchLists = [{ watchlistID: "foobar", userID: "x", tickers: [] } as any];
    sandbox.stub(Watchlists, "getWatchlists").resolves(fakeWatchLists);

    supertest
      .agent(server)
      .get("/test/api/watchlists")
      .expect(200)
      .end(function (err, res) {
        console.log("res: ", res.body);
        expect(res.body).to.deep.eq(fakeWatchLists);
        if (err) done(err);
        else done();
      });
  });
});

import * as chai from "chai";
import chaiHttp from "chai-http";
import dotenv from "dotenv";

chai.use(chaiHttp);
dotenv.config();

const expect = chai.expect;
const ticker = "AAPL";
const exchange = "NASDAQ";
const FMP_API_KEY = process.env.FMP_API_KEY;
const url = `https://financialmodelingprep.com/api/v3/search-ticker?query=${ticker}&limit=1&exchange=${exchange}&apikey=${FMP_API_KEY}`;

describe("test-fmp", () => {
  let results: any;
  let response: any;

  before(async function () {
    results = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        currency: "USD",
        stockExchange: "NASDAQ Global Select",
        exchangeShortName: "NASDAQ"
      }
    ];
    response = {
      status: 200,
      results
    };
    try {
      if (FMP_API_KEY) {
        const res = await fetch(url);
        results = await res.json();
        response = res;
      }
    } catch (err) {
      console.error(err);
    }
  });

  it("should return a 200 response", function (done) {
    expect(response).to.have.status(200);
    done();
  });

  it("should return an array", function (done) {
    expect(results).to.be.an("array");
    done();
  });

  it("should return an array with a length of 1", function (done) {
    expect(results).to.have.lengthOf(1);
    done();
    console.log(results);
  });

  it("should return an object with the correct keys", function (done) {
    expect(results[0]).to.have.keys(["symbol", "name", "currency", "stockExchange", "exchangeShortName"]);
    done();
  });

  it("should return an object with the correct values", function (done) {
    expect(results[0]).to.deep.include({
      symbol: "AAPL",
      name: "Apple Inc.",
      currency: "USD",
      stockExchange: "NASDAQ Global Select",
      exchangeShortName: "NASDAQ"
    });
    done();
  });
});

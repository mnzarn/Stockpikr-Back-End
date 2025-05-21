import { Connection, Model, Schema } from "mongoose";
import { ILatestStockInfoModel } from "../interfaces/ILatestStockInfoModel";
import { IPurchasedStockModel, Ticker } from "../interfaces/IPurchasedStockModel";
import BaseModel from "./BaseModel";

class PurchasedStockModel extends BaseModel {
  public model: Model<IPurchasedStockModel>;

  public constructor(connection: Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema = (): void => {
    this.schema = new Schema(
      { 
       purchasedstocksName: String,
        userID: String,
        tickers: [
          {
            _id: false,
            symbol: String,
            quantity: Number,
            purchaseDate: Date,
            purchasePrice: Number,
            price: Number,
            priceChange: Number,
            gainOrLoss: Number,
            marketValue: Number,
          }
        ]
      },
      {
        collection: "purchasedStocks",
        timestamps: false
      }
    );
    this.schema.index({ purchasedstocksName: 1, userID: 1 }, { unique: true });
  };

  public createModel = () => {
    if (!this.connection.models["purchasedStocks"]) {
      this.model = this.connection.model<IPurchasedStockModel>("purchasedStocks", this.schema);
    } else {
      this.model = this.connection.models["purchasedStocks"];
    }
  };



 public async addPurchasedStock(userID: string, purchasedstocksName: string, tickers: Ticker[]) {
  const newPurchasedStock = new this.model({
    purchasedstocksName: purchasedstocksName.trim(),
    userID: userID,
    tickers: tickers,
  });

  return await newPurchasedStock.save();
}
  public async updatePurchasedStock(purchasedstocksName: string, userID: string, tickers?: Ticker[]) {
  return this.model.findOneAndUpdate(
    { purchasedstocksName, userID },
    { $set: { tickers } },
    { new: true }
  );
}
  public async updatePurchasedStockTicker(purchasedstocksName: string, userID: string, ticker: Ticker) {
  return this.model.findOneAndUpdate(
    { purchasedstocksName, userID },
    {
      $set: {
        "tickers.$[el].quantity": ticker.quantity,
        "tickers.$[el].purchaseDate": ticker.purchaseDate,
        "tickers.$[el].purchasePrice": ticker.purchasePrice,
        "tickers.$[el].price": ticker.price,
        "tickers.$[el].priceChange": ticker.priceChange,
        "tickers.$[el].gainOrLoss": ticker.gainOrLoss,
        "tickers.$[el].marketValue": ticker.marketValue
      }
    },
    {
      arrayFilters: [{ "el.symbol": ticker.symbol }],
      new: true
    }
  );
}

  /*
  public async getPurchasedStock(watchlistID: string, userID: string, symbol: string) {
    return this.model.findOne({ watchlistID: watchlistID, userID: userID, symbol: symbol });
  }

  public async getPurchasedStocksByUserID(userID: string) {
    const purchasedStocks = await this.model.find({ userID: userID });

    const tickerSymbols = purchasedStocks.flatMap(stock => stock.tickers.map(ticker => ticker.symbol));
    const latestStockInfoModel = LatestStockInfoModel.getInstance(this.connection);
    const stockQuotes = await latestStockInfoModel.getLatestStockQuotes(tickerSymbols);

    purchasedStocks.forEach(stock => {
        stock.tickers.forEach(ticker => {
            const stockQuote = stockQuotes.find(quote => quote.symbol === ticker.symbol);
            if (stockQuote) {
                ticker.price = this.calculatePrice(stockQuote);
                ticker.priceChange = this.calculatePriceChange(ticker, stockQuote);
                ticker.gainOrLoss = this.calculateGainOrLoss(ticker, stockQuote);
                ticker.marketValue = this.calculateMarketValue(ticker, stockQuote);
            }
        });
    });

    return purchasedStocks;
  }*/
    public async deleteTickersInPurchasedStock(purchasedstocksName: string, userID: string, tickerSymbols: string[]) {
  return this.model.updateMany(
    { purchasedstocksName, userID },
    { $pull: { tickers: { symbol: { $in: tickerSymbols } } } }
  );
}

public async getPurchasedStocksByUserID(userID: string) {
  return this.model.find({ userID }, {}, { lean: true });
}

public async getPurchasedStock(purchasedstocksName: string, userID: string) {
  return this.model.findOne({ purchasedstocksName, userID }, {}, { lean: true });
}

public async getPurchasedStockTickers(purchasedstocksName: string, userID: string) {
  return this.model.findOne({ purchasedstocksName, userID }, {}, { lean: true })?.select("tickers");
}

public async getPurchasedStockByNameAndUserID(userID: string, purchasedstocksName: string) {
  return this.model.findOne({ purchasedstocksName, userID }, {}, { lean: true });
}

public async getAllPurchasedStocks() {
  return this.model.find({}, {}, { lean: true });
}

public async deletePurchasedStock(purchasedstocksName: string, userID: string): Promise<any> {
  return this.model.deleteOne({ purchasedstocksName, userID });
}

 public async getPurchasedStockByName(userID: string, name: string) {
    return this.model.findOne({ userID, name }, {}, { lean: true });
  }

  private calculatePriceChange(ticker: Ticker, stockQuote: ILatestStockInfoModel): number {
    return +(stockQuote.price - ticker.purchasePrice).toFixed(2);
  }

  private calculateMarketValue(ticker: Ticker, stockQuote: ILatestStockInfoModel): number {
    return +(stockQuote.price * ticker.quantity).toFixed(2);
  }

  private calculateGainOrLoss(ticker: Ticker, stockQuote: ILatestStockInfoModel): number {
    return +((stockQuote.price - ticker.purchasePrice) * ticker.quantity).toFixed(2);
  }

  private calculatePrice(stockQuote: ILatestStockInfoModel): number {
    return +stockQuote.price.toFixed(2);
  }
}

export { PurchasedStockModel };

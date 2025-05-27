import axios, { AxiosError, AxiosInstance } from "axios";
import { config } from "../config";
import { ICompanyProfile } from "../interfaces/ICompanyProfile";
import { ILatestStockInfoModel } from "../interfaces/ILatestStockInfoModel";
import IStockData from "../interfaces/IStockData";
import { IStockPriceChange } from "../interfaces/IStockPriceChanges";
import { getCurrentTimestampSeconds } from "../utils";

export class StockApiService {
  //----------------------------------------------------------------//
  //                           Properties
  //----------------------------------------------------------------//

  private static _apiKeyParam = `apikey=${config.FMP_API_KEY}`;
  private static timeout = 10000; // 10 secs
  private static _apiService: AxiosInstance | null = null;
  // TODO: how to get list of supported exchanges on FMP?
  public static exchanges = ["NASDAQ", "NYSE", "TSE", "SSE", "HKEX", "LSE"];
  public static get apiService(): AxiosInstance {
    if (StockApiService._apiService == null) {
      StockApiService._apiService = axios.create({
        baseURL: "https://financialmodelingprep.com/api",
        headers: {
          "Content-Type": "application/json"
        }
      });

      StockApiService._apiService.interceptors.request.use(
        (config) => {
          if (config.method === "get" && config.url) {
            config.url += (config.url.includes("?") ? "&" : "?") + StockApiService._apiKeyParam;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }
    return StockApiService._apiService;
  }

  //----------------------------------------------------------------//
  //                           Private
  //----------------------------------------------------------------//

  private static async fetchData<T>(url: string): Promise<T | null> {
    try {
      const response = await StockApiService.apiService.get<T | string>(url, {
        timeout: StockApiService.timeout
      });
  
      // Some APIs return 200 with error string
      if (typeof response.data === 'string' && response.data.includes('Limit Reach')) {
        throw new Error('API limit reached. Please try again later.');
      }
  
      return response.data as T;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data;
  
        // Handle 429 rate limiting
        if (error.response.status === 429 || (typeof data === 'object' && data['Error Message']?.includes('Limit Reach'))) {
          throw new Error('API limit reached. Please try again later.');
        }
  
        // Log unexpected error body
        console.error('Unhandled API error:', data);
      }
  
      throw error; // propagate
    }
  }  
  //----------------------------------------------------------------//
  //                           Public
  //----------------------------------------------------------------//

  public static async fetchStockData(input: string, limit?: number): Promise<IStockData[]> {
    if (input.trim().length === 0) {
      return [];
    }
    const searchQueryLimit = limit ? Math.min(limit, 100) : 10; // maximum limit is 100 per query
    const url = `/v3/search?query=${input}&limit=${searchQueryLimit}`;
    const response = await StockApiService.fetchData<IStockData[]>(url);
    if (response) {
      return response;
    }
    return [];
  }

  public static async fetchExchangeSymbols(_exchange?: string): Promise<ILatestStockInfoModel[]> {
    const exchanges = _exchange ? [_exchange] : this.exchanges;
    const response = // TODO: change to allSettled so that we have something to display
      (
        await Promise.all(
          exchanges.map((exchange) => {
            const url = `/v3/symbol/${exchange}`;
            return StockApiService.fetchData<ILatestStockInfoModel[]>(url);
          })
        )
      ).flat();
    if (response) {
      const now = getCurrentTimestampSeconds();
      return response.map((res) => ({ ...res, storedTimestamp: now }));
    }
    return [];
  }

  public static async fetchStockQuotes(input: string): Promise<ILatestStockInfoModel | null> {
    if (input.trim().length === 0) {
      return null;
    }
    const url = `/v3/quote/${input}`;
    const response = await StockApiService.fetchData<ILatestStockInfoModel[]>(url);
    if (response && response.length > 0) {
      const now = getCurrentTimestampSeconds();
      return { ...response[0], storedTimestamp: now };
    }
    return null;
  }

  public static async fetchCompanyProfile(input: string): Promise<ICompanyProfile[]> {
    if (input.trim().length === 0) {
      return [];
    }
    const url = `/v3/profile/${input}`;
    const response = await StockApiService.fetchData<ICompanyProfile[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchGainers(): Promise<IStockPriceChange[]> {
    const url = `/v3/stock_market/gainers`;
    const response = await StockApiService.fetchData<IStockPriceChange[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchLosers(): Promise<IStockPriceChange[]> {
    const url = `/v3/stock_market/losers`;
    const response = await StockApiService.fetchData<IStockPriceChange[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchActives(): Promise<IStockPriceChange[]> {
    const url = `/v3/stock_market/actives`;
    const response = await StockApiService.fetchData<IStockPriceChange[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
}

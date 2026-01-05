
import { GoogleGenAI, Type } from "@google/genai";
import { MarketState } from "../types";

export const fetchMarketData = async (): Promise<MarketState> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const prompt = `Search for the latest closing or current values for:
1. Major US Indices: S&P 500, Dow Jones Industrial Average, and NASDAQ Composite (include value, point change, percentage change).
2. For each index, provide an array of exactly 12 numerical values representing the price trend throughout the latest full trading day.
3. Market Volatility: CBOE Volatility Index (VIX) value and percentage change.
4. Sentiment: Latest CNN Fear & Greed Index score (0-100) and label.
5. Put/Call Ratio: Latest CBOE Total Put/Call Ratio value and a short label (e.g., Bullish, Neutral, Bearish).
6. Sector Performance: Percentage changes for exactly 16 major sectors and sub-sectors (e.g., Tech, Healthcare, Financials, Energy, Real Estate, Materials, Utilities, Consumer Staples, Consumer Discretionary, Communication Services, Industrials, Semiconductors, Banking, Software, Hardware, Retail).
7. For each of these 16 sectors, identify the top 3 gainer and top 3 loser ticker symbols and their percentage change.

Format the response as JSON with the following schema:
{
  "indices": [{"name": string, "value": string, "change": string, "percentChange": string, "isPositive": boolean, "trend": number[]}],
  "vix": {"value": string, "change": string, "percentChange": string},
  "fearGreed": {"value": number, "label": string},
  "putCallRatio": {"value": number, "label": string},
  "sectors": [{"name": string, "percentChange": number, "topGainers": [{"symbol": string, "change": string}], "topLosers": [{"symbol": string, "change": string}]}],
  "lastUpdated": string
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            indices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                  percentChange: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN },
                  trend: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ["name", "value", "change", "percentChange", "isPositive", "trend"]
              }
            },
            vix: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                change: { type: Type.STRING },
                percentChange: { type: Type.STRING }
              },
              required: ["value", "change", "percentChange"]
            },
            fearGreed: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.NUMBER },
                label: { type: Type.STRING }
              },
              required: ["value", "label"]
            },
            putCallRatio: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.NUMBER },
                label: { type: Type.STRING }
              },
              required: ["value", "label"]
            },
            sectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  percentChange: { type: Type.NUMBER },
                  topGainers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING },
                        change: { type: Type.STRING }
                      },
                      required: ["symbol", "change"]
                    }
                  },
                  topLosers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING },
                        change: { type: Type.STRING }
                      },
                      required: ["symbol", "change"]
                    }
                  }
                },
                required: ["name", "percentChange", "topGainers", "topLosers"]
              }
            },
            lastUpdated: { type: Type.STRING }
          },
          required: ["indices", "vix", "fearGreed", "putCallRatio", "sectors", "lastUpdated"]
        }
      }
    });

    const data = JSON.parse(response.text);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Market Source",
      uri: chunk.web?.uri || "#"
    })) || [];

    return { ...data, sources };
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    throw error;
  }
};

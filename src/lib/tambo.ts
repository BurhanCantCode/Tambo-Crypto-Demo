/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { CryptoCard, cryptoCardSchema } from "@/components/crypto/CryptoCard";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import { getCurrentCryptoInfo } from "@/services/crypto-data";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "getCryptoPrice",
    description:
      "Use this for ANY crypto-related query. Gets price data for any cryptocurrency (BTC, ETH, etc.) and displays it in a beautiful card.",
    tool: async (args: { symbol: string }) => {
      try {
        const { symbol } = args;
        
        // Validate inputs
        if (!symbol || typeof symbol !== 'string') {
          throw new Error('Invalid symbol provided');
        }
        
        console.log('Fetching crypto price for:', symbol);
        
        const cryptoInfo = await getCurrentCryptoInfo(symbol);
        
        console.log('Crypto info:', cryptoInfo);
        
        // Validate response data
        if (!cryptoInfo) {
          throw new Error('Failed to get current crypto information');
        }
        
        // Return data formatted for CryptoCard component
        const result = {
          symbol: cryptoInfo.symbol || symbol.toUpperCase(),
          name: cryptoInfo.name || symbol.toUpperCase(),
          currentPrice: cryptoInfo.current_price || 0,
          priceChange24h: cryptoInfo.price_change_24h || 0,
          priceChangePercentage24h: cryptoInfo.price_change_percentage_24h || 0,
          marketCap: cryptoInfo.market_cap || 0,
          volume24h: cryptoInfo.volume_24h || 0,
        };
        
        console.log('Returning result:', result);
        return result;
      } catch (error) {
        console.error('Error in getCryptoPrice tool:', error);
        throw new Error(error instanceof Error ? error.message : "Failed to fetch crypto data");
      }
    },
    toolSchema: z
      .function()
      .args(
        z.object({
          symbol: z.string().describe("The cryptocurrency symbol (e.g., BTC, ETH, ADA)"),
        })
      )
      .returns(cryptoCardSchema),
  },

  // Keep existing tools for demo
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    toolSchema: z
      .function()
      .args(z.string().describe("The continent to filter countries by"))
      .returns(
        z
          .object({
            continent: z.string().optional(),
            sortBy: z.enum(["population", "growthRate"]).optional(),
            limit: z.number().optional(),
            order: z.enum(["asc", "desc"]).optional(),
          })
          .optional(),
      ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    toolSchema: z
      .function()
      .args(z.string().describe("The continent to filter countries by"))
      .returns(
        z
          .object({
            startYear: z.number().optional(),
            endYear: z.number().optional(),
          })
          .optional(),
      ),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "CryptoCard",
    description:
      "Beautiful crypto price card with current price, changes, market cap, and volume.",
    component: CryptoCard,
    propsSchema: cryptoCardSchema,
  },
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Add more components here
];
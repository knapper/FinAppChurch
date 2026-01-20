
import { GoogleGenAI } from "@google/genai";
import { MonthlyClosing } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// We use a safe access pattern to prevent ReferenceErrors in non-Node environments (like standard browsers).
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getFinancialInsights = async (closingData: MonthlyClosing) => {
  if (!ai) {
    console.warn("Gemini API client not initialized. Check your API_KEY environment variable.");
    return "AI Insights are currently unavailable. Please ensure your API key is configured.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise financial health summary for our church for the month of ${closingData.month}. 
      Total Income: $${closingData.totalIncome}
      Total Expenses: $${closingData.totalExpenses}
      Net: $${closingData.netBalance}. 
      Offer advice on charity allocation or expense management. Keep it encouraging and professional.`,
      config: {
        temperature: 0.7,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Unable to generate AI insights at this time.";
  }
};


import { GoogleGenAI } from "@google/genai";
import { MonthlyClosing } from "../types";

// Initialize the Gemini API client using the environment variable for the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (closingData: MonthlyClosing) => {
  try {
    // Generate financial insights based on the provided monthly closing data.
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
    // Access the generated text content from the response object.
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Unable to generate AI insights at this time.";
  }
};

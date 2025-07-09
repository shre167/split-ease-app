import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "INR" | "USD" | "EUR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, fromCurrency?: Currency) => number;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (you can update these or fetch from an API)
const EXCHANGE_RATES: Record<Currency, number> = {
  INR: 1,      // Base currency
  USD: 0.012,  // 1 INR = 0.012 USD
  EUR: 0.011,  // 1 INR = 0.011 EUR
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem("currency") as Currency) || "INR";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const convertCurrency = (amount: number, fromCurrency: Currency = "INR"): number => {
    if (fromCurrency === currency) return amount;
    
    // Convert from source currency to INR first, then to target currency
    const amountInINR = fromCurrency === "INR" ? amount : amount / EXCHANGE_RATES[fromCurrency];
    return currency === "INR" ? amountInINR : amountInINR * EXCHANGE_RATES[currency];
  };

  const formatCurrency = (amount: number): string => {
    const convertedAmount = convertCurrency(amount);
    
    const symbols: Record<Currency, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
    };

    return symbols[currency] + convertedAmount.toFixed(1);
  };

  const getCurrencySymbol = (): string => {
    const symbols: Record<Currency, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
    };
    return symbols[currency];
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatCurrency, 
      convertCurrency,
      getCurrencySymbol 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};

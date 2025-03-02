// ETFs and Mutual Funds
export default [

    // ETF Holdings and Information
    { version: 'v4', name: 'etfHoldingsByDate', path: (symbol) => `etf-holdings/portfolio-date?symbol=${symbol}` },
    { version: 'v4', name: 'etfHoldings', path: (symbol, date) => `etf-holdings?date=${date}&symbol=${symbol}` },
    { version: 'v3', name: 'etfHolder', path: (symbol) => `etf-holder/${symbol}` },
    { version: 'v4', name: 'etfInfo', path: (symbol) => `etf-info?symbol=${symbol}` },
    { version: 'v3', name: 'etfSectorWeightings', path: (symbol) => `etf-sector-weightings/${symbol}` },
    { version: 'v3', name: 'etfCountryWeightings', path: (symbol) => `etf-country-weightings/${symbol}` },
    { version: 'v3', name: 'etfStockExposure', path: (symbol) => `etf-stock-exposure/${symbol}` },

    // Mutual Fund Holdings and Information
    { version: 'v4', name: 'mutualFundHoldingsByDate', path: (symbol, cik) => `mutual-fund-holdings/portfolio-date?symbol=${symbol}&cik=${cik}` },
    { version: 'v4', name: 'mutualFundHoldings', path: (symbol, date) => `mutual-fund-holdings?symbol=${symbol}&date=${date}` },
    { version: 'v4', name: 'mutualFundHoldingsByName', path: (name) => `mutual-fund-holdings/name?name=${name}` },
    { version: 'v3', name: 'mutualFundHolder', path: (symbol) => `mutual-fund-holder/${symbol}` },
    { version: 'v4', name: 'etfHolderBulk', path: () => `etf-holder-bulk` },
];
// Import configuration files
import companies from '../src/config/companies.mjs';
import search from '../src/config/search.mjs';
import market from '../src/config/market.mjs';
import financials from '../src/config/financials.mjs';
import metrics from '../src/config/metrics.mjs';
import targets from '../src/config/targets.mjs';
import news from '../src/config/news.mjs';
import reports from '../src/config/reports.mjs';
import events from '../src/config/events.mjs';
import historical from '../src/config/historical.mjs';
import funds from '../src/config/funds.mjs';
import instutional from '../src/config/institutional.mjs';
import indices from '../src/config/indices.mjs';
import commitments from '../src/config/commitments.mjs';
import treasury from '../src/config/treasury.mjs';
import commodities from '../src/config/commodities.mjs';
import constituents from '../src/config/constituents.mjs';
import bulk from '../src/config/bulk.mjs';

// Reusable test function
const validateConfig = (configArray, configName) => {
    describe(`${configName} Config`, () => {
        test('should export an array', () => {
            expect(Array.isArray(configArray)).toBe(true);
        });

        test('should have required properties', () => {
            configArray.forEach(endpoint => {
                expect(endpoint).toHaveProperty('version');
                expect(endpoint).toHaveProperty('name');
                expect(endpoint).toHaveProperty('path');
                expect(typeof endpoint.version).toBe('string');
                expect(typeof endpoint.name).toBe('string');
                expect(typeof endpoint.path).toBe('function');

                // Test the path function
                const path = endpoint.path();
                expect(typeof path).toBe('string');
            });
        });
    });
};

// Run tests for each configuration
validateConfig(companies, 'Companies');
validateConfig(market, 'Market');
validateConfig(search, 'Search');
validateConfig(financials, 'Financials');
validateConfig(metrics, 'Metrics');
validateConfig(targets, 'Targets');
validateConfig(news, 'News');
validateConfig(reports, 'Reports');
validateConfig(events, 'Events');
validateConfig(historical, 'Historical');
validateConfig(funds, 'Funds');
validateConfig(instutional, 'Institutional');
validateConfig(indices, 'Indices');
validateConfig(commitments, 'Commitments');
validateConfig(treasury, 'Treasury');
validateConfig(commodities, 'Commodities');
validateConfig(constituents, 'Constituents');
validateConfig(bulk, 'Bulk');
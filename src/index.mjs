// Configs; i.e., API endpoints by category
import companies from './config/companies.mjs';
import search from './config/search.mjs';
import market from './config/market.mjs';
import financials from './config/financials.mjs';
import metrics from './config/metrics.mjs';
import targets from './config/targets.mjs';
import news from './config/news.mjs';
import reports from './config/reports.mjs';
import events from './config/events.mjs';
import historical from './config/historical.mjs';
import funds from './config/funds.mjs';
import instutional from './config/institutional.mjs';
import indices from './config/indices.mjs';
import commitments from './config/commitments.mjs';
import treasury from './config/treasury.mjs';
import commodities from './config/commodities.mjs';
import constituents from './config/constituents.mjs';
import bulk from './config/bulk.mjs';

// Financial Modeling Prep API Wrapper for Node.js
export default class FinancialModelingPrepClient {

    // Private
    #apiKey;

    /**
     * Constructor to initialize the client with API key and options
     * 
     * @param {string} apiKey - The API key for the Financial Modeling Prep API
     * @param {object} [userOptions] - The options to customize the client
     * @param {number} [userOptions.timeout=3000] - The request timeout in milliseconds
     * @param {string} [userOptions.base='https://financialmodelingprep.com/api/'] - The base URL of the API
     * @returns {void}
     */
    constructor(apiKey, userOptions = {}) {

        // Hardcode Domain Base
        this.domain = 'https://financialmodelingprep.com';

        // Throw an error if no API key is provided
        if (!apiKey) throw new Error('API key is required');

        // Define default options
        const defaultOptions = { timeout: 3000, base: '/api/' };

        // Merge default options with the provided options
        Object.assign(this, defaultOptions, userOptions);

        // Store API Key (private)
        this.#apiKey = apiKey;

        // Combine all endpoints
        const allEndpoints = [
            ...companies,
            ...market,
            ...search,
            ...financials,
            ...metrics,
            ...targets,
            ...news,
            ...reports,
            ...events,
            ...historical,
            ...funds,
            ...instutional,
            ...indices,
            ...commitments,
            ...treasury,
            ...commodities,
            ...constituents,
            ...bulk
        ];

        // Create the endpoints dynamically
        allEndpoints.forEach(({ version, name, path }) => {

            // Dynamically create methods for each endpoint
            this[name] = (params = {}) => {

                // Determine the path with or without parameters
                const url = path(...Object.values(params));

                // Fetch the data with the constructed path
                return this.fetch(`${version}/${url}`);
            };
        });
    }

    /**
     * Perform a fetch request with a timeout
     * 
     * @param {string} endpoint - The API endpoint
     * @returns {Promise<Object>} - Parsed JSON data
     */
    async fetch(endpoint) {

        // Construct the full URL with the API key
        const url = `${this.domain}${this.base}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${this.#apiKey}`;

        // Ensure HTTPS to avoid leaking the API key
        if (!url.startsWith('https')) throw new Error('URL must be HTTPS');
        
        // Return a promise that races between the fetch request and a timeout
        return Promise.race([
                        
            // Fetch promise
            fetch(url).then(async (response) => {

                // Throw an error if the response is not OK
                if (!response.ok) {

                    // Check for 401 Unauthorized
                    if (response.status === 401) throw new Error('401 Forbidden: Check API Key');

                    // Throw an error with the HTTP status
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Parse the JSON response
                const data = await response.json();
                
                // Return Parsed Data
                return data;

            // Fetch Failure
            }),

            // Timeout promise
            new Promise((_, reject) =>

                // Reject the promise after the timeout
                setTimeout(() => reject(new Error(`Request timed out`)), this.timeout)
            )
        ]);
    }

    /**
     * Dynamic method to fetch data from any endpoint with any version
     *
     * @param {string} version - The API version (e.g., 'v3', 'v4', etc.)
     * @param {string} endpoint - The endpoint path (e.g., 'treasury', 'company/profile/ticker')
     * @param {object} [params] - The query parameters to include in the URL
     * @returns {Promise} - A promise that resolves with the fetched data
     */
    any(version, endpoint, params = {}) {

        // Construct the query string from params
        const queryString = Object.entries(params)

            // Filter out undefined values
            .filter(([_, value]) => value !== undefined)

            // Encode the key-value pairs
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)

            // Join the key-value pairs with '&'
            .join('&');

        // Construct the full URL
        const urlPath = `${version}/${endpoint}${queryString ? `?${queryString}` : ''}`;

        // Fetch the data with the constructed path
        return this.fetch(urlPath);
    }

    /**
     * Returns an array of all dynamically created method names
     *
     * @returns {string[]} - An array of method names
     */
    getAllEndpoints() {

        // Get all property names of the current instance
        const properties = Object.getOwnPropertyNames(this);

        // Filter out these method names
        return properties.filter(name =>
            
            // Check if the property is a function and is not inherited
            typeof this[name] === 'function' && this.hasOwnProperty(name)
        );
    }
}
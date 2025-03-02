import FinancialModelingPrepClient from '../src/index.mjs';
import constituents from '../src/config/constituents.mjs';

describe('FinancialModelingPrepClient', () => {
    let client;
    let apiKey = 'dummy-api-key';

    beforeAll(() => {
        client = new FinancialModelingPrepClient(apiKey);
        client.fetch = jest.fn(async (url) => ({ url }));
        global.fetch = jest.fn(); 
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor()', () => {
        test('should initialize with default options', () => {
            expect(client.timeout).toBe(3000);
            expect(client.base).toBe('/api/');
        });

        test('should override default options with user options', () => {
            const customOptions = { timeout: 5000, base: 'https://customapi.com/api/' };
            const customClient = new FinancialModelingPrepClient(apiKey, customOptions);
            expect(customClient.timeout).toBe(5000);
            expect(customClient.base).toBe('https://customapi.com/api/');
        });

        test('should throw an error if no API key is provided', () => {
            expect(() => new FinancialModelingPrepClient()).toThrow('API key is required');
        });

        test('should store the API key privately', () => {
            expect(client.apiKey).toBeUndefined();
        });
    });

    describe('endpoints', () => {
        constituents.forEach(({ name, version, path }) => {
            test(`should create method ${name}`, async () => {
                expect(typeof client[name]).toBe('function');
                await client[name]();
                const expectedUrl = `${version}/${path()}`;
                expect(client.fetch).toHaveBeenCalledWith(expectedUrl);
            });
        });
    });

    describe('fetch()', () => {
        test('should call fetch with correct URL and return data', async () => {
            const endpoint = 'v4/treasury?from=2024-09-13&to=2024-09-14';
            const expectedResponse = { url: `${client.base}${endpoint}&apikey=${client.apiKey}` };
            client.fetch.mockResolvedValue(expectedResponse);
            const result = await client.fetch(endpoint);
            expect(client.fetch).toHaveBeenCalledWith(endpoint);
            expect(result).toEqual(expectedResponse);
        });
        test('should throw error on network failure', async () => {
            const networkFailureClient = new FinancialModelingPrepClient(apiKey);
            const endpoint = 'v4/treasury?from=2024-09-13&to=2024-09-14';
            global.fetch.mockRejectedValue(new Error('Network error'));
            await expect(networkFailureClient.fetch(endpoint)).rejects.toThrow('Network error');
        });
        test('should throw error on 401 HTTP response', async () => {
            const networkFailureClient = new FinancialModelingPrepClient(apiKey);
            const endpoint = 'v4/treasury?from=2024-09-13&to=2024-09-14';
            global.fetch.mockResolvedValue({
                ok: false, // Simulate a 401 HTTP status
                status: 401, // Example status
                json: jest.fn().mockResolvedValue({}),
            });
            await expect(networkFailureClient.fetch(endpoint)).rejects.toThrow(`401 Forbidden: Check API Key`);
        });
        test('should throw error on non-2xx HTTP response', async () => {
            const networkFailureClient = new FinancialModelingPrepClient(apiKey);
            const endpoint = 'v4/treasury?from=2024-09-13&to=2024-09-14';
            global.fetch.mockResolvedValue({
                ok: false, // Simulate a non-2xx HTTP status
                status: 404, // Example status
                json: jest.fn().mockResolvedValue({}),
            });
            await expect(networkFailureClient.fetch(endpoint)).rejects.toThrow(`HTTP error! Status: 404`);
        });
        test('should throw error if json parsing fails', async () => {
            const networkFailureClient = new FinancialModelingPrepClient(apiKey);
            const endpoint = 'v4/treasury?from=2024-09-13&to=2024-09-14';
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockRejectedValue(new Error('JSON parsing error')),
            });
            await expect(networkFailureClient.fetch(endpoint)).rejects.toThrow('JSON parsing error');
        });
        test('should throw error if request times out', async () => {
            const networkFailureClient = new FinancialModelingPrepClient(apiKey, { timeout: 0 });
            const endpoint = 'v4/treasury?from=2024-09-13&to=2024-09-14';
            global.fetch.mockImplementation(() => new Promise(() => {}));
            await expect(networkFailureClient.fetch(endpoint)).rejects.toThrow(`Request timed out`);
        });
        test('should append ?apikey when endpoint has no query parameters', async () => {
            const client = new FinancialModelingPrepClient(apiKey);
            const endpoint = 'v4/marketdata';
            const expectedUrl = `${client.domain}${client.base}${endpoint}?apikey=${apiKey}`;
            const expectedResponse = { data: 'someData' };
            global.fetch.mockResolvedValue({ ok: true, json: async () => expectedResponse });
            const result = await client.fetch(endpoint);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
            expect(result).toEqual(expectedResponse);
        });
        test('should ensure HTTPS in the URL', async () => {
            // Mock the client.domain to be 'http://example.com'
            const client = new FinancialModelingPrepClient(apiKey, { domain: 'http://financialmodelingprep.com' });
            const endpoint = 'v4/marketdata';
            const expectedUrl = `${client.domain}${client.base}${endpoint}?apikey=${apiKey}`;
            await expect(client.fetch(endpoint)).rejects.toThrow('URL must be HTTPS');
        });
    });

    describe('any()', () => {
        test('should dynamically call an endpoint with any version and parameters', async () => {
            const version = 'v4';
            const endpoint = 'treasury';
            const params = { from: '2024-09-13', to: '2024-09-14' };
            await client.any(version, endpoint, params);
            const expectedUrl = `${version}/${endpoint}?from=2024-09-13&to=2024-09-14`;
            expect(client.fetch).toHaveBeenCalledWith(expectedUrl);
        });

        test('should dynamically call an endpoint without parameters', async () => {
            const version = 'v3';
            const endpoint = 'company/profile/TICKER';
            await client.any(version, endpoint);
            const expectedUrl = `${version}/${endpoint}`;
            expect(client.fetch).toHaveBeenCalledWith(expectedUrl);
        });

        test('should handle undefined parameters gracefully', async () => {
            const version = 'v4';
            const endpoint = 'treasury';
            const params = { from: '2024-09-13', to: undefined };
            await client.any(version, endpoint, params);
            const expectedUrl = `${version}/${endpoint}?from=2024-09-13`;
            expect(client.fetch).toHaveBeenCalledWith(expectedUrl);
        });
    });

    describe('getAllEndpoints()', () => {
        test('should return all dynamically created method names', () => {
            const methods = client.getAllEndpoints();
            expect(methods).not.toContain('getAllEndpoints');
            constituents.forEach(({ name }) => {
                expect(methods).toContain(name);
            });
            expect(Array.isArray(methods)).toBe(true);
        });
    });
});
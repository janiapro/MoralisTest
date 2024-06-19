const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Correct the path to the node key file
const nodeKeyFilePath = path.join(__dirname, 'playwright/.auth/node_key.json');

// Read the node key from the JSON file
if (!fs.existsSync(nodeKeyFilePath)) {
  throw new Error(`node key file not found at path: ${nodeKeyFilePath}`);
}

const { nodeKey } = JSON.parse(fs.readFileSync(nodeKeyFilePath, 'utf8'));

// The nodeKey already contains the full URL, so we use it directly
const rpcUrl = nodeKey;

describe('Ethereum RPC API Tests', () => {
    let txHash = null; // Variable to store transaction hash across tests

    const jsonRpcPayload = (method, params = []) => ({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
    });

    it('should fetch the current block number', async () => {
        const payload = jsonRpcPayload('eth_blockNumber');
        const response = await axios.post(rpcUrl, payload);
        
        // Positive assertions
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('result');
        
        const blockNumber = parseInt(response.data.result, 16);
        console.log('Current Block Number:', blockNumber);
        expect(blockNumber).toBeGreaterThan(0); // Ensure block number is greater than 0

        // Negative assertions
        expect(response.data.result).toMatch(/^0x[a-fA-F0-9]+$/); // Ensure result is a valid hex string
        expect(response.data.result).not.toBe('0x'); // Ensure result is not just '0x'
        expect(response.data.result).not.toBeNull(); // Ensure result is not null
        expect(response.data.result.length).toBeGreaterThan(2); // Ensure result is more than just '0x'
    });

    it('should fetch a block by number and validate its properties', async () => {
        const blockNumber = 'latest'; // Can use a specific block number in hex or 'latest'
        const payload = jsonRpcPayload('eth_getBlockByNumber', [blockNumber, true]);
        const response = await axios.post(rpcUrl, payload);

        // Positive assertions
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('result');
        
        const blockDetails = response.data.result;
        console.log('Block Details:', blockDetails);

        // Validate block properties
        expect(blockDetails).toHaveProperty('number');
        expect(blockDetails).toHaveProperty('hash');
        expect(blockDetails).toHaveProperty('parentHash');
        expect(blockDetails).toHaveProperty('transactions');
        expect(blockDetails).toHaveProperty('timestamp');
        expect(blockDetails).toHaveProperty('miner');
        expect(blockDetails).toHaveProperty('gasLimit');
        expect(blockDetails).toHaveProperty('gasUsed');

        // Negative assertions
        expect(blockDetails.number).not.toBeNull();
        expect(blockDetails.hash).not.toBeNull();
        expect(blockDetails.parentHash).toMatch(/^0x[a-fA-F0-9]{64}$/); // Ensure it's a valid hash
        expect(blockDetails.transactions).not.toBeNull();
        expect(blockDetails.miner).toMatch(/^0x[a-fA-F0-9]{40}$/); // Ensure it's a valid Ethereum address
        expect(blockDetails.gasLimit).toMatch(/^0x[a-fA-F0-9]+$/); // Ensure it's a valid hex string
        expect(blockDetails.gasUsed).toMatch(/^0x[a-fA-F0-9]+$/); // Ensure it's a valid hex string

        // Extract the first transaction hash if available
        if (blockDetails.transactions.length > 0) {
            txHash = blockDetails.transactions[0].hash || blockDetails.transactions[0]; // Handle different formats
            console.log('Using Transaction Hash:', txHash);
            expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/); // Ensure it's a valid transaction hash
        } else {
            console.log('No transactions found in the latest block');
        }
    });

    describe('Transaction Details Test', () => {
        beforeAll(() => {
            if (!txHash) {
                console.log('No transaction hash to test with, skipping test');
            }
        });

        it('should fetch transaction details using the transaction hash', async () => {
            if (!txHash) {
                return; // Skip this test if no transaction hash was found
            }

            const payload = jsonRpcPayload('eth_getTransactionByHash', [txHash]);
            const response = await axios.post(rpcUrl, payload);

            // Positive assertions
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('result');

            const transactionDetails = response.data.result;
            if (transactionDetails) {
                console.log('Transaction Details:', transactionDetails);

                // Validate transaction properties
                expect(transactionDetails).toHaveProperty('hash');
                expect(transactionDetails.hash).toBe(txHash);
                expect(transactionDetails).toHaveProperty('blockNumber');
                expect(transactionDetails).toHaveProperty('from');
                expect(transactionDetails).toHaveProperty('to');
                expect(transactionDetails).toHaveProperty('value');

                // Negative assertions
                expect(transactionDetails.hash).toMatch(/^0x[a-fA-F0-9]{64}$/); // Ensure it's a valid transaction hash
                expect(transactionDetails.blockNumber).not.toBeNull();
                expect(transactionDetails.from).toMatch(/^0x[a-fA-F0-9]{40}$/); // Ensure it's a valid Ethereum address
                expect(transactionDetails.to).toMatch(/^0x[a-fA-F0-9]{40}$/); // Ensure it's a valid Ethereum address
                expect(transactionDetails.value).toMatch(/^0x[a-fA-F0-9]+$/); // Ensure it's a valid hex string
            } else {
                console.log('No transaction found with that hash');
            }
        });
    });
});

import http from 'k6/http';
import { check, sleep } from 'k6';

// Placeholder for the node URL
const nodeURL = "<NODE_KEY_PLACEHOLDER>";

export let options = {
    stages: [
        { duration: '1m', target: 10 }, // Ramp-up to 10 users over 1 minute
        { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
        { duration: '1m', target: 0 },  // Ramp-down to 0 users over 1 minute
    ],
};

export default function () {
    // Test eth_blockNumber
    let blockNumberRes = http.post(nodeURL, JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
    }), { headers: { 'Content-Type': 'application/json' } });

    check(blockNumberRes, {
        'blockNumber status is 200': (r) => r.status === 200,
        'blockNumber result is not null': (r) => r.json().result !== null,
    });

    // Extract the block number from the response
    let blockNumber = blockNumberRes.json().result;

    // Test eth_getBlockByNumber
    let blockByNumberRes = http.post(nodeURL, JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [blockNumber, true],
        id: 1
    }), { headers: { 'Content-Type': 'application/json' } });

    check(blockByNumberRes, {
        'blockByNumber status is 200': (r) => r.status === 200,
        'blockByNumber result is not null': (r) => r.json().result !== null,
    });

    // Extract a transaction hash from the response
    let transactions = blockByNumberRes.json().result.transactions;
    if (transactions.length > 0) {
        let txHash = transactions[0].hash || transactions[0];

        // Test eth_getTransactionByHash
        let transactionByHashRes = http.post(nodeURL, JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [txHash],
            id: 1
        }), { headers: { 'Content-Type': 'application/json' } });

        check(transactionByHashRes, {
            'transactionByHash status is 200': (r) => r.status === 200,
            'transactionByHash result is not null': (r) => r.json().result !== null,
        });
    }

    // Pause for a short duration between iterations
    sleep(1);
}

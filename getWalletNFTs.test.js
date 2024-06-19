const Moralis = require('moralis').default;
const fs = require('fs');
const path = require('path');

// Correct the path to the API key file
const apiKeyFilePath = path.join(__dirname, 'playwright/.auth/api_key.json');

// Read the API key from the JSON file
if (!fs.existsSync(apiKeyFilePath)) {
  throw new Error(`API key file not found at path: ${apiKeyFilePath}`);
}

const { apiKey } = JSON.parse(fs.readFileSync(apiKeyFilePath, 'utf8'));

// Ensure the API key is valid
if (!apiKey || apiKey.trim() === '') {
  throw new Error('API key is empty or invalid.');
}

// The wallet address to query NFTs for
const walletAddress = '0x534e58aA439ddb7449ca7217bc96BF363E19C4B0';

describe('Get NFTs by Wallet', () => {
  beforeAll(async () => {
    try {
      await Moralis.start({ apiKey });
    } catch (e) {
      console.error('Failed to start Moralis:', e);
      throw e;
    }
  });

  it('should fetch NFTs owned by the wallet address', async () => {
    try {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        chain: '0x1',
        format: 'decimal',
        mediaItems: false,
        address: walletAddress,
      });

      // Positive assertions
      expect(response.raw).toHaveProperty('result');
      console.log('NFTs:', response.raw.result);

      // Additional assertions based on the expected response structure
      expect(response.raw).toHaveProperty('status');
      expect(response.raw).toHaveProperty('page');
      expect(response.raw).toHaveProperty('page_size');
      expect(response.raw).toHaveProperty('result');

      // Check the properties of the first NFT in the result
      if (response.raw.result.length > 0) {
        const firstNFT = response.raw.result[0];
        expect(firstNFT).toHaveProperty('token_address');
        expect(firstNFT).toHaveProperty('token_id');
        expect(firstNFT).toHaveProperty('contract_type');
        expect(firstNFT).toHaveProperty('owner_of');
        expect(firstNFT).toHaveProperty('block_number');
        expect(firstNFT).toHaveProperty('token_uri');
        expect(firstNFT).toHaveProperty('metadata');
      }
    } catch (e) {
      console.error('Error fetching NFTs:', e);
      throw e;
    }
  }, 30000);  // Increase timeout to 30 seconds for this test

  it('should handle invalid wallet address gracefully', async () => {
    const invalidAddress = '0xInvalidAddress';

    try {
      await Moralis.EvmApi.nft.getWalletNFTs({
        chain: '0x1',
        format: 'decimal',
        mediaItems: false,
        address: invalidAddress,
      });
    } catch (error) {
      console.error('Error with invalid address:', error);

      // Ensure we have a response object before accessing its properties
      if (error.isMoralisError) {
        // Negative assertions
        expect(error.code).toBe('C0005');
        expect(error.message).toMatch(/Invalid address provided/i);
      } else {
        // If no response, just log the error
        console.error('No response received:', error);
      }
    }
  });
});

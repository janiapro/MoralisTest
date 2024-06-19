                            
# Moralis Automation Testing

This project contains automated tests for the Moralis Admin panel, demonstrating both frontend (UI) and backend (API) test cases using Playwright, Jest, and K6.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Creating Moralis Account](#creating-moralis-account)
- [Running Tests](#running-tests)
- [Running K6 Load Tests](#running-k6-load-tests)

## Prerequisites
- Node.js (v14 or above)
- npm or yarn
- Moralis account

## Setup Instructions
1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/MoralisTest.git
    cd MoralisTest
    ```

2. **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

## Creating Moralis Account
To use the Moralis Admin panel and API, you need to create an account. Follow these steps:

1. **Visit the Moralis Admin panel:**
    Go to [Moralis Admin](https://admin.moralis.io/).

2. **Sign Up:**
    - Click on the `Sign Up` button.
    - Fill in the required information (name, email, password).
    - Verify your email address by clicking on the verification link sent to your email.
    - Make sure you log out, if you logged in.

3. **Create a `.env` file:**
    Create a `.env` file in the root directory of your project and add your Moralis login credentials:
    ```plaintext
    LOGIN_EMAIL=your-email@example.com
    LOGIN_PASSWORD=your-secure-password
    ```

## Running Tests

1. **Run all tests with Playwright:**
    ```sh
    npx playwright test
    ```

This command will:
- Authenticate and save the user state.
- Create and save the Node Key.
- Copy and save the API Key.

By using state preservation, the authentication step will be executed only once, and the saved state will be used for subsequent tests.

2. **Run individual Jest API tests:**
    - **Get Wallet NFTs Test:**
        ```sh
        npx jest getWalletNFTs.test.js
        ```
        This test will:
        - Fetch NFTs owned by a specified wallet address.
        - Validate the structure and properties of the response.
        - Handle invalid wallet addresses gracefully.

    - **RPC API Tests:**
        ```sh
        npx jest rpc.test.js
        ```
        This test will:
        - Fetch the current block number from the Ethereum network.
        - Fetch a block by number and validate its properties.
        - Fetch transaction details using a transaction hash and validate the properties.

## Running K6 Load Tests

The K6 load tests are designed to test the performance of the Ethereum RPC API methods under load. The following steps describe how the K6 tests work and how to run them:

### How the K6 Tests Work

1. **Preprocessing Script (`preprocess-k6.js`):**
    - Reads the Node Key from a file (`node_key.json`).
    - Replaces a placeholder in the K6 test template with the actual Node Key.
    - Writes the processed K6 test file to disk.
    - Executes the K6 test using the processed test file.

2. **K6 Test Script (`k6-test-template.js`):**
    - Tests `eth_blockNumber` to fetch the current block number.
    - Tests `eth_getBlockByNumber` to fetch a block by number and validate its properties.
    - Tests `eth_getTransactionByHash` to fetch transaction details using a transaction hash and validate the properties.

3. **Shell Script (`run-tests.sh`):**
    - Runs the preprocessing script to read the Node Key and execute the K6 test.

### Running the K6 Load Tests

1. **Run the K6 tests using the shell script:**
    ```sh
    ./run-tests.sh
    ```

Feel free to explore the test files and scripts for more details on the implementations.

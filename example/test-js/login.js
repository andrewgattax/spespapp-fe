import axios from 'axios';
import { readFileSync } from 'fs';
import { sign } from 'crypto';
import base64url from 'base64url';

// Configuration
const API_BASE_URL = 'http://localhost:8080/api/auth';
const USERNAME = process.argv[2] || 'manu';

async function testAuthentication() {
  try {
    console.log(`Testing authentication for user: ${USERNAME}\n`);

    // Load private key
    const privateKey = readFileSync('private.pem', 'utf-8');
    console.log(privateKey)
    console.log(' Private key loaded from private.pem\n');

    // Phase 1: Init login
    console.log('Phase 1: Initiating login...');
    const initResponse = await axios.post(`${API_BASE_URL}/login/init`, {
      username: USERNAME
    });

    const { id: challengeId, nonceBase64 } = initResponse.data;
    console.log(` Challenge received: ${challengeId}`);
    console.log(`  Nonce (base64url): ${nonceBase64.substring(0, 20)}...\n`);

    // Decode nonce from base64url to raw bytes
    const nonceBytes = Buffer.from(nonceBase64, 'base64');
    console.log(` Nonce decoded (${nonceBytes.length} bytes)\n`);

    // Sign the nonce using RSA-SHA256
    console.log('  Attempting to sign with private key...');
    let signature, signatureBase64;
    try {
      signature = sign('sha256', nonceBytes, privateKey);
      signatureBase64 = signature.toString('base64');
      console.log(' Signing succeeded');
      console.log(`  Signature length: ${signature.length} bytes`);
      console.log(`  Signature (base64): ${signatureBase64.substring(0, 20)}...`);
      console.log(`  First 50 chars: ${signatureBase64.substring(0, 50)}\n`);
    } catch (signError) {
      console.error(' Signing failed with error:', signError.message);
      throw signError;
    }

    // Phase 2: Complete login
    console.log('Phase 2: Completing login...');
    const completeResponse = await axios.post(`${API_BASE_URL}/login/complete`, {
      challengeId: challengeId,
      signatureBase64: signatureBase64
    });

    const { authToken } = completeResponse.data;
    console.log(' Authentication successful!');
    console.log(`  Auth Token: ${authToken}`);

    return authToken;
  } catch (error) {
    console.error('\n Authentication failed!');

    if (error.response) {
      // Server responded with error status
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('  No response from server. Is it running on', API_BASE_URL, '?');
    } else {
      // Error setting up request
      console.error(`  Error: ${error.message}`);
    }

    throw error;
  }
}

// Run the test
testAuthentication()
  .then(() => console.log('Test completed successfully!'))
  .catch(() => console.log('Test failed!'));

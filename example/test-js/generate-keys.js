import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';

console.log('Generating RSA 2048-bit key pair...\n');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save private key to file
writeFileSync('private.pem', privateKey);
console.log(' Private key saved to: private.pem\n');

// Extract public key base64 (without PEM headers)
const publicKeyBase64 = publicKey
  .replace('-----BEGIN PUBLIC KEY-----', '')
  .replace('-----END PUBLIC KEY-----', '')
  .replace(/\n/g, '')
  .replace(/\r/g, '')
  .trim();

console.log('Public Key (base64, for database):');
console.log(publicKeyBase64);
console.log('\n');

console.log('SQL INSERT statement:');
console.log(`INSERT INTO user_public_keys (user_id, public_key_base64) VALUES`);
console.log(`  (<user_id>, '${publicKeyBase64}');`);
console.log('\n');

console.log('Public Key (PEM format, for reference):');
console.log(publicKey);

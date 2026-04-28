import {ApiError, post, put, del} from '../client'
import {
  LoginResponse,
  AuthChallenge,
  CompleteLoginRequest,
  UpdateDeviceIdRequest,
  UpdatePublicKeyRequest
} from "../types"
import {getPrivateKey, getDeviceId, getUsername} from "@/utils/keyManager";
import crypto from 'react-native-quick-crypto';
import { Buffer } from 'buffer';

class UserService {

  private async signChallenge(challenge: AuthChallenge): Promise<string> {
    const privateKey = await getPrivateKey();

    if (!privateKey) {
      throw new ApiError({
        message: "Nessuna chiave registrata. Registrati",
        error: "NO_PRIVATE_KEY",
        status: 400,
        path: "/mammita"
      });
    }

    try {
      // Sign the raw bytes using RSA-SHA256
      const sign = crypto.createSign('sha256');
      const nonceBytes = Buffer.from(challenge.nonceBase64, 'base64');
      sign.update(nonceBytes);

      const signatureBase64 = sign.sign({
        format: "pem",
        type: "pkcs8",
        key: privateKey
      }, 'base64') as string;

      // Convert signature to base64
      return signatureBase64
    } catch (error) {
      console.error(error)
      throw new Error(`Failed to sign challenge: ${error}`);
    }
  }

  async login() {

    const username = await getUsername();

    // Step 1: Initialize login and get challenge
    const challenge = await post<AuthChallenge>("/auth/login/init", {username});

    // Step 2: Sign the challenge with the private key
    const signatureBase64 = await this.signChallenge(challenge);

    const deviceId = await getDeviceId(true);

    if(!deviceId) {
      throw new Error("Failed to get device ID");
    }

    // Step 3: Complete login with the signature
    const completeRequest: CompleteLoginRequest = {
      challengeId: challenge.id,
      signatureBase64,
      deviceId
    };

    return post<LoginResponse>("/auth/login/complete", completeRequest);
  }

  async updateDeviceId(data: UpdateDeviceIdRequest) {
    return put<void>("/auth/config/device-id", data)
  }

  async updatePublicKey(data: UpdatePublicKeyRequest) {
    return put<void>("/auth/config/public-key", data)
  }

  async deleteConfig(deviceId: string) {
    return del<void>(`/auth/config/${deviceId}`)
  }

}

export const userService = new UserService()
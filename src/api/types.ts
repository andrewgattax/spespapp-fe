export interface ErrorResponse {
  message: string
  error: string
  status: number
  path: string
}

export interface LoginResponse {
  authToken: string
}

export interface AuthChallenge {
  id: string,
  username: string,
  nonceBase64: string,
  expiresAt: Date
}

export interface CompleteLoginRequest {
  challengeId: string,
  signatureBase64: string
  deviceId: string
}

export interface InitLoginRequest {
  username: string
}

export interface UpdateDeviceIdRequest {
  previousDeviceId: string
  newDeviceId: string
}

export interface UpdatePublicKeyRequest {
  publicKeyBase64: string,
  deviceId: string
}




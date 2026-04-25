export interface ErrorResponse {
  message: string
  error: string
  status: number
  path: string
}

export interface LoginResponse {
  token: string
}

export interface GeneraStoriaResponse {
  id: number,
  categoria: string,
  status: string,
  titolo: string,
  contenuto: string
}

export interface GeneraStoriaRequest {
  categoria: "FUNNY" | "SAD" | "DARK"
}

export interface TemplateCompactResponse {
  id: number,
  titolo: string,
  preview: string,
  categoria: string,
  storieCreateCount: number
}

// Story types from openapi-docs.json
export interface StoriaCompactResponse {
  id: number
  titolo: string
  categoria: string  // "FUNNY" | "DARK" | "SAD"
  autore: string
  preview: string
  public: boolean
}

export interface StoriaResponse {
  id: number
  titolo: string
  autore: string
  contenuto: string
  templateId: number
  categoria: string  // "FUNNY" | "DARK" | "SAD"
  pubblico: boolean
}

export interface CreaStoriaRequest {
  titolo: string
  contenuto: string
  templateId: number
  pubblico?: boolean
}

// Template types from openapi-docs.json
export interface TemplateResponse {
  id: number
  titolo: string
  contenuto: string
  categoria: string  // "FUNNY" | "DARK" | "SAD"
  status: string  // "PROCESSING" | "COMPLETED" | "FAILED"
  storieCreateCount: number
  used: boolean
  saved: boolean
}

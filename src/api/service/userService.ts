import { post } from '@/api'
import type {LoginResponse} from "@/api";

class UtenteService {

  async login(body: any) {
    return post<LoginResponse>("/auth/login/test", body)
  }

}

export const userService = new UtenteService()
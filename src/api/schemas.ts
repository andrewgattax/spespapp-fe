import { z } from "zod"

export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Inserisci un username").min(4, "L'username deve essere minimo 4 caratteri"),
  password: z.string().min(1, "Inserisci la password")
})

export const SignupRequestSchema = z.object({
  username: z.string().min(1, "Inserisci un username").min(4, "L'username deve essere minimo 4 caratteri"),
  password: z
      .string()
      .min(8, "La password deve essere di almeno 8 caratteri")
      .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
      .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
      .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  verificaPassword: z.string().min(1, "Inserisci la conferma della password")
}).refine(data => data.password === data.verificaPassword, {message: "Le password non corrispondono", path: ["verificaPassword"]})

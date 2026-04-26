import { z } from "zod"

export const UpdateDeviceIdSchema = z.object({
  newDeviceId: z.string().min(1, "Il nuovo deviceId è obbligatorio")
})

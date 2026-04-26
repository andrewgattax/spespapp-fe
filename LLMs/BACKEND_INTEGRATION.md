# Backend Integration Guidelines

---

## 🔴 GOLDEN RULE: NEVER HALLUCINATE BACKEND SPECS

- **DO**: Ask the user for backend endpoints, DTOs, and OpenAPI specs
- **DO**: Read from provided `openapi.json` if available
- **DO NOT**: Guess endpoint paths, request/response structures, or field names
- **DO NOT**: Assume REST conventions - backend may not follow them
- **DO NOT**: Create services without explicit backend specification

---

## 📁 CRITICAL FILE LOCATIONS

```
src/
├── api/
│   ├── client.ts              # Axios client configuration (DO NOT modify)
│   ├── schemas.ts             # Zod validation schemas for complex forms
│   ├── types.ts               # TypeScript interfaces for simple requests/responses
│   ├── index.ts               # Export all services and types
│   └── service/
│       ├── utenteService.ts   # User authentication endpoints
│       ├── templateService.ts # Template endpoints
│       └── storiaService.ts   # Story endpoints
├── context/
│   └── UserContext.tsx        # Logged user state management
└── pages/
    ├── Login.tsx              # Reference: complete form implementation
    ├── Signup.tsx             # Reference: form with password confirmation
    └── Profile.tsx            # User profile page
```

---

## 🔄 API LAYER ARCHITECTURE

Follow this exact flow for every backend integration:

```
User Action → Form (React Hook Form + Zod) → Service Method → API Client → Backend
                           ↓
                     Zod Validation
                           ↓
                     Type Safe Request/Response
```

---

## 📝 STEP 1: CREATE TYPES/SCHEMAS

### When to use Zod Schemas (`src/api/schemas.ts`)
**USE FOR**: Complex forms with validation rules, user input, React Hook Form

```typescript
// ✅ CORRECT
import { z } from "zod"

export const CreateStoriaRequestSchema = z.object({
  titolo: z.string().min(1, "Inserisci un titolo").max(100, "Titolo troppo lungo"),
  descrizione: z.string().min(10, "Descrizione troppo corta").max(500),
  templateId: z.number().int().positive("Template non valido"),
  categoria: z.enum(["avventura", "romanzo", "fantascienza", "thriller"]),
  visibilita: z.boolean().default(false)
})
```

### When to use TypeScript Interfaces (`src/api/types.ts`)
**USE FOR**: Simple request bodies, ALL response types, internal types

```typescript
// ✅ CORRECT - Request body (no complex validation)
export interface UpdateVisibilitaRequest {
  visibilita: boolean
}

// ✅ CORRECT - Response type
export interface StoriaResponse {
  id: number
  titolo: string
  descrizione: string
  createdAt: string
  updatedAt: string
  visibile: boolean
}

// ✅ CORRECT - Response with nested data
export interface TemplateDettagliatoResponse {
  id: number
  titolo: string
  preview: string
  categoria: string
  strutture: StrutturaResponse[]
  storieCreateCount: number
}
```

**❌ DO NOT**: Use Zod for simple request bodies that don't need validation
**❌ DO NOT**: Use plain types for forms with user input - always use Zod schemas

---

## 🔧 STEP 2: CREATE SERVICE METHODS

Location: `src/api/service/[name]Service.ts`

**Pattern: Class-based service with instance methods**

```typescript
// ✅ CORRECT - Complete service implementation
import { post, get, put, del } from "../client"
import { CreateStoriaRequestSchema } from "../schemas"
import type { StoriaResponse, UpdateVisibilitaRequest } from "../types"

class StoriaService {
  // Zod schema input - no type annotation needed for body
  async create(body: z.infer<typeof CreateStoriaRequestSchema>) {
    return post<StoriaResponse>("/storia/create", body)
  }

  // TypeScript interface input - type annotation required
  async updateVisibilita(body: UpdateVisibilitaRequest, id: number) {
    return put<StoriaResponse>(`/storia/${id}/visibilita`, body)
  }

  // No request body
  async getAll() {
    return get<StoriaResponse[]>("/storia/all")
  }

  // Path parameter only
  async delete(id: number) {
    return del<void>(`/storia/${id}`)
  }
}

export const storiaService = new StoriaService()
```

**Rules:**
- Export a **singleton instance**, not the class
- Use `z.infer<typeof SchemaName>` for Zod schema bodies
- Use interface name for typed request bodies
- **ALWAYS** specify response type in generic: `post<Response>(...)`
- Path parameters go in URL string, not body

---

## 📤 STEP 3: EXPORT FROM INDEX

Location: `src/api/index.ts`

```typescript
// ✅ CORRECT
export * from './client'
export * from './types'
export { utenteService } from './service/utenteService.ts'
export { templateService } from "./service/templateService.ts"
export { storiaService } from "./service/storiaService.ts"
```

---

## 🎨 STEP 4: IMPLEMENT FORM COMPONENT

Location: `src/pages/` or component files

**Reference implementation**: `src/pages/Login.tsx`

```typescript
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CreateStoriaRequestSchema } from "@/api/schemas"
import { storiaService, ApiError } from "@/api"
import { useUser } from "@/context/UserContext"

function CreateStoriaForm() {
  // 1. Type inference from Zod schema
  type FormData = z.infer<typeof CreateStoriaRequestSchema>

  // 2. Access logged user
  const { user } = useUser()

  // 3. Server error state
  const [serverError, setServerError] = useState("")

  // 4. Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(CreateStoriaRequestSchema),
    mode: "onTouched"  // Validate on blur, not on every keystroke
  })

  // 5. Submit handler
  const onSubmit = async (data: FormData) => {
    setServerError("")  // Clear previous errors

    try {
      const response = await storiaService.create(data)
      // Handle success - redirect, update state, etc.
      console.log("Created:", response)
    } catch (error) {
      // 6. Error handling - ALWAYS check for ApiError
      if (error instanceof ApiError) {
        setServerError(error.payload.message)
      } else {
        console.error("Unexpected error:", error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 7. Server error display */}
      {serverError && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded">
          {serverError}
        </div>
      )}

      {/* 8. Field with validation error */}
      {errors.titolo?.message && (
        <p className="text-destructive text-sm">{errors.titolo.message}</p>
      )}
      <input
        placeholder="Titolo"
        {...register("titolo")}
        className="w-full p-2 border rounded"
      />

      {/* 9. Submit button with loading state */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creazione..." : "Crea Storia"}
      </Button>
    </form>
  )
}
```

**Critical Form Rules:**
- **ALWAYS** use `zodResolver` with your Zod schema
- **ALWAYS** clear server errors at start of submit handler
- **ALWAYS** catch `ApiError` and display `error.payload.message`
- **ALWAYS** disable submit button while `isSubmitting`
- **DO NOT** call services outside of submit handler
- **DO NOT** forget `mode: "onTouched"` for better UX

---

## ⚠️ ERROR HANDLING PATTERNS

### ApiError Structure
```typescript
class ApiError extends Error {
  statusCode: number
  payload: {
    message: string    // User-friendly error message
    error: string      // Technical error type
    status: number     // HTTP status code
    path: string       // Request path
  }
}
```

### Correct Error Handling
```typescript
// ✅ CORRECT
try {
  await service.login(data)
} catch (error) {
  if (error instanceof ApiError) {
    // Display user-friendly message
    setError(error.payload.message)
  }
}

// ❌ WRONG - Don't assume error structure
catch (error) {
  setError(error.message)  // Might not exist
}

// ❌ WRONG - Don't ignore errors
catch (error) {
  console.error(error)
}
```

---

## 📋 COMPLETE WORKFLOW EXAMPLE

**Task**: Add "Update Profile" functionality

### 1. Ask for Backend Specs
```
"What are the endpoint details for updating user profile?
Please provide:
- Endpoint path and method
- Request DTO structure
- Response DTO structure
- Or share the openapi.json file"
```

### 2. Create Schema/Types
```typescript
// src/api/schemas.ts
export const UpdateProfileRequestSchema = z.object({
  username: z.string().min(4).max(20),
  bio: z.string().max(200).optional()
})

// src/api/types.ts
export interface UserProfileResponse {
  username: string
  bio: string | null
  storiePubblicate: number
  storieCondivise: number
  templateSalvati: number
}
```

### 3. Create Service Method
```typescript
// src/api/service/utenteService.ts
class UtenteService {
  // ... existing methods

  async updateProfile(body: z.infer<typeof UpdateProfileRequestSchema>) {
    return put<UserProfileResponse>("/utente/profile", body)
  }
}
```

### 4. Create Form Component
```typescript
// src/pages/Profile.tsx
import { UpdateProfileRequestSchema } from "@/api/schemas"
import { utenteService, ApiError } from "@/api"
import { useUser } from "@/context/UserContext"

function Profile() {
  const { user, loadFromJwt } = useUser()
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(UpdateProfileRequestSchema),
    defaultValues: {
      username: user?.username || "",
      bio: ""
    }
  })

  const onSubmit = async (data) => {
    setServerError("")
    setSuccess(false)

    try {
      await utenteService.updateProfile(data)
      setSuccess(true)
      // Optionally reload user data
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.payload.message)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... form fields ... */}
    </form>
  )
}
```

---

## 🚨 COMMON MISTAKES TO AVOID

1. **❌ Creating services without backend specs**
   - Always ask user for endpoint details first

2. **❌ Using `any` in service methods**
   - Use `z.infer<typeof Schema>` or proper interfaces

3. **❌ Forgetting to export services from index.ts**
   - Services won't be importable

4. **❌ Not catching ApiError in forms**
   - Errors won't display to users

5. **❌ Using Zod for simple API requests**
   - Use TypeScript interfaces instead

6. **❌ Forgetting response type in API calls**
   - `post<Response>(url, body)` not `post(url, body)`

7. **❌ Not disabling submit button during submission**
   - Causes duplicate submissions

8. **❌ Storing user data in component state**
   - Use UserContext instead

---

## ✅ CHECKLIST BEFORE IMPLEMENTING

- [ ] Have I received backend endpoint specs from user?
- [ ] Have I checked if `openapi.json` is available?
- [ ] Am I using Zod schema for forms with validation?
- [ ] Am I using TypeScript interface for simple requests?
- [ ] Did I add response type to API call?
- [ ] Did I export the service from `index.ts`?
- [ ] Am I catching `ApiError` in form submit handler?
- [ ] Am I displaying `error.payload.message` to user?
- [ ] Am I disabling submit button while submitting?

> **Note**: For Italian language requirements, user context usage, and UI development patterns, see [dev_guidelines.md](./dev_guidelines.md)

---

**When in doubt, reference:**
- Login form: `src/pages/Login.tsx`
- Service pattern: `src/api/service/utenteService.ts`
- API client: `src/api/client.ts`

# Backend Integration Guidelines

This document provides guidelines for LLMs working with backend API integration in the Spespapp frontend.

## Architecture Overview

The API layer follows a structured pattern:

```
src/api/
├── client.ts          # Axios client with interceptors and HTTP methods
├── types.ts           # TypeScript DTOs and interfaces
├── schemas.ts         # Zod validation schemas
├── index.ts           # Central export point
└── service/           # Service classes for each backend controller
    ├── userService.ts
    ├── recipeService.ts
    └── ...
```

## Core Principles

### 1. One Service Per Controller
- Each backend controller has a corresponding service in `src/api/service/`
- Example: `recipeController` → `recipeService.ts`, `userController` → `userService.ts`
- Services are implemented as classes with a single exported instance

### 2. Use HTTP Methods from client.ts
Import and use the wrapper functions from `client.ts`:

```typescript
import { get, post, put, del } from "@/api/client"

// Usage
async getAllRecipes(): Promise<RecipeDTO[]> {
  return get<RecipeDTO[]>("/recipe")
}

async addRecipe(request: AddRecipeRequest): Promise<RecipeDTO> {
  return post<RecipeDTO>("/recipe", request)
}
```

### 3. Define DTOs in types.ts
All request/response interfaces must be defined in `src/api/types.ts`:

```typescript
export interface RecipeDTO {
  id: number
  name: string
  ingredients: IngredientDTO[]
}

export interface AddRecipeRequest {
  name: string
  ingredientNames: string[]
}
```

### 4. Export Everything Through index.ts
All services, types, and utilities are re-exported from `src/api/index.ts`:

```typescript
export * from './client'
export * from './types'
export * from './schemas'
export { userService } from './service/userService'
export { recipeService } from './service/recipeService'
```

This allows clean imports:
```typescript
import { RecipeDTO, recipeService, ApiError } from '@/api'
```

## Service Implementation Pattern

Follow this pattern when creating new services:

```typescript
// src/api/service/exampleService.ts
import { ExampleDTO, CreateExampleRequest } from "../types"
import { get, post, put, del } from "../client"

class ExampleService {
  async getAll(): Promise<ExampleDTO[]> {
    return get<ExampleDTO[]>("/example")
  }

  async getById(id: number): Promise<ExampleDTO> {
    return get<ExampleDTO>(`/example/${id}`)
  }

  async create(request: CreateExampleRequest): Promise<ExampleDTO> {
    return post<ExampleDTO>("/example", request)
  }

  async update(id: number, request: UpdateExampleRequest): Promise<ExampleDTO> {
    return put<ExampleDTO>(`/example/${id}`, request)
  }

  async delete(id: number): Promise<void> {
    return del<void>(`/example/${id}`)
  }
}

const exampleService = new ExampleService()
export { exampleService }
```

## Error Handling

### ApiError Class
All API errors throw an `ApiError` exception (defined in `client.ts:9`):

```typescript
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly payload: ErrorResponse

  constructor(payload: ErrorResponse) {
    super(payload.message)
    this.name = 'ApiError'
    this.statusCode = payload.status
    this.payload = payload
  }
}
```

### Proper Error Handling Pattern
Always use try-catch when calling services and check for `ApiError`:

```typescript
import { ApiError, recipeService } from '@/api'

const loadRecipes = async () => {
  try {
    const response = await recipeService.getAllRecipes()
    setRecipes(response)
  } catch (e) {
    console.error("Failed to load recipes", e)
    if (e instanceof ApiError) {
      setError(e.payload.message)
    } else {
      setError(e instanceof Error ? e.message : "Default error message")
    }
  }
}
```

## Authentication

The API client (`client.ts:29-44`) automatically attaches JWT tokens to requests:

- Tokens are stored securely with key `'auth_token'`
- The request interceptor adds `Authorization: Bearer <token>` to all requests
- 401 responses trigger automatic token cleanup (client.ts:50-59)

**Never manually attach auth headers** - the interceptor handles it.

## Golden Rules

### 🔴 NEVER Hallucinate

1. **NEVER invent DTOs or interfaces** - Always check `api-docs.json` first
2. **NEVER guess endpoint paths or HTTP methods** - Verify in `api-docs.json`
3. **NEVER assume request/response structures** - Check the OpenAPI spec
4. **NEVER add fields that don't exist** - Only use what's documented

### 🟡 When in Doubt, ASK

If you cannot find something in `api-docs.json`:
1. Search the existing codebase for similar patterns
2. Ask the user for clarification
3. Do NOT make assumptions

### 🟢 Best Practices

1. **Match backend naming**: If the backend has `AddRecipeDTO`, name it `AddRecipeRequest` or `AddRecipeDTO` in the frontend
2. **Use proper typing**: Always parametrize HTTP methods with the response type: `get<RecipeDTO[]>(...)`
3. **Handle edge cases**: Check for empty arrays, null values, undefined fields
4. **Log errors**: Always console.error with context for debugging
5. **Clean imports**: Import from `@/api` for cleaner code

## Working with api-docs.json

The `api-docs.json` file contains the OpenAPI 3.1.0 specification for the backend.

### Finding Endpoints

Search for the path pattern:
```json
"/recipe": {
  "get": { "operationId": "getAllRecipes", ... },
  "post": { "operationId": "addRecipe", ... }
}
```

### Finding Request/Response Schemas

Look in `components.schemas`:
```json
"RecipeDTO": {
  "type": "object",
  "properties": {
    "id": { "type": "integer", "format": "int64" },
    "name": { "type": "string" },
    "ingredients": { "type": "array", "items": { "$ref": "#/components/schemas/IngredientDTO" } }
  }
}
```

### Finding Required Fields

Check the `required` array in schemas:
```json
"AddRecipeDTO": {
  "required": ["ingredientNames", "name"]
}
```

## Example Workflow: Adding a New Feature

1. **Check api-docs.json** for the endpoint, method, request/response schemas
2. **Add types** to `src/api/types.ts` (both DTOs and request interfaces)
3. **Create service** in `src/api/service/[name]Service.ts` following the pattern
4. **Export service** from `src/api/index.ts`
5. **Import and use** in components with proper error handling
6. **Test thoroughly** with both success and error cases

## Common Pitfalls

❌ **Wrong**: Creating types without checking api-docs.json
```typescript
// Don't guess field names or types!
export interface RecipeDTO {
  recipeId: number  // Wrong! Backend uses "id"
  title: string     // Wrong! Backend uses "name"
}
```

✅ **Right**: Verify against api-docs.json
```typescript
// After checking api-docs.json
export interface RecipeDTO {
  id: number
  name: string
  ingredients: IngredientDTO[]
}
```

❌ **Wrong**: Calling endpoints without checking if they exist
```typescript
// Don't assume this endpoint exists!
get<RecipeDTO[]>("/recipes/all")
```

✅ **Right**: Verify endpoint exists in api-docs.json
```typescript
// After checking: GET /recipe returns RecipeDTO[]
get<RecipeDTO[]>("/recipe")
```

## Existing Services Reference

- **userService**: Authentication, device ID, public key management
- **recipeService**: CRUD operations for recipes

When working with these services, import from `@/api`:
```typescript
import { userService, recipeService } from '@/api'
```

---

**Remember**: The api-docs.json is your source of truth. When it contradicts assumptions, the docs win. Always ask when unsure!

## UI State Management

When consuming APIs in views/components, you **MUST** always handle three states properly:

### 1. Loading State
Track loading state and always clear it in a `finally` block:

```typescript
const [loading, setLoading] = useState(true)

const loadRecipes = async () => {
  try {
    // fetch data
  } catch (e) {
    // handle error
  } finally {
    setLoading(false) // Always clear loading state
  }
}
```

### 2. Error State - Display with Retry
Always show errors to users and provide a retry mechanism:

```typescript
const [error, setError] = useState("")

const loadRecipes = async () => {
  try {
    setError("") // Clear previous errors
    const response = await recipeService.getAllRecipes()
    setRecipes(response)
  } catch (e) {
    console.error("Failed to load recipes", e)
    if (e instanceof ApiError) {
      setError(e.payload.message)
    } else {
      setError(e instanceof Error ? e.message : "Default error message")
    }
  } finally {
    setLoading(false)
  }
}

// In render
{error ? (
  <View style={{padding: Spacing.four, alignItems: 'center', marginTop: Spacing.eight}}>
    <Text style={{color: theme.destructive, marginBottom: Spacing.three, textAlign: 'center'}}>
      {error}
    </Text>
    <Button
      title="Riprova"
      onPress={loadRecipes}
      variant="outlined"
    />
  </View>
) : (
  // actual content or empty state
)}
```

### 3. Empty State - Inform and Guide
When API returns empty arrays, show a helpful message with icon:

```typescript
// In render, after checking error
{filteredRecipes.length === 0 ? (
  <View style={{padding: Spacing.four, alignItems: 'center', flex: 1, justifyContent: 'center', marginTop: Spacing.eight}}>
    <MaterialCommunityIcons name="food-halal" size={64} color={theme.textMuted} />
    <Text style={{color: theme.textMuted, marginTop: Spacing.three, fontSize: Spacing.three}}>
      Nessuna ricetta trovata
    </Text>
    <Text style={{color: theme.textMuted, marginTop: Spacing.two}}>
      Aggiungi la tua prima ricetta!
    </Text>
  </View>
) : (
  // render actual list
  <ButtonCardGroup>
    {filteredRecipes.map(recipe => (
      <ButtonCard ... />
    ))}
  </ButtonCardGroup>
)}
```

### Complete State Pattern
The full pattern should look like this:

```typescript
// 1. Setup states
const [loading, setLoading] = useState(true)
const [error, setError] = useState("")
const [data, setData] = useState<DataType[]>([])

// 2. Load function with proper error handling
const loadData = useCallback(async () => {
  try {
    setError("")
    const response = await someService.getAll()
    setData(response)
  } catch (e) {
    console.error("Failed to load data", e)
    if (e instanceof ApiError) {
      setError(e.payload.message)
    } else {
      setError(e instanceof Error ? e.message : "Default user-friendly message")
    }
  } finally {
    setLoading(false)
  }
}, [])

// 3. In render: loading → error → empty → content
{loading ? (
  // Show loading indicator - user will specify what to use
  <LoadingIndicator />
) : error ? (
  <ErrorDisplay error={error} onRetry={loadData} />
) : data.length === 0 ? (
  <EmptyState message="No items found" />
) : (
  <DataList items={data} />
)}
```

### Best Practices

✅ **Always**:
- Use `finally` block to clear loading state
- Clear previous errors before new requests
- Log errors with context for debugging
- Provide retry buttons for failed requests
- Use descriptive, user-friendly error messages
- Show appropriate icons in empty states

❌ **Never**:
- Leave loading state stuck on errors
- Show raw error messages to users (use ApiError.payload.message)
- Ignore empty states (always show something)
- Mix up the order: loading → error → empty → content

### Reference Implementation

See `src/app/(auth)/(tabs)/recipes.tsx:57-162` for a complete example of proper state management with error handling, empty states, and pull-to-refresh.

import {RecipeDTO, AddRecipeRequest} from "../types";
import {get, post} from "../client";

class RecipeService {

    async getAllRecipes(): Promise<RecipeDTO[]> {
        return get<RecipeDTO[]>("/recipe");
    }

    async getRecipeByName(name: string): Promise<RecipeDTO> {
        return get<RecipeDTO>(`/recipe/${encodeURIComponent(name)}`);
    }

    async addRecipe(request: AddRecipeRequest): Promise<RecipeDTO> {
        return post<RecipeDTO>("/recipe", request);
    }

}

const recipeService = new RecipeService();

export {recipeService}
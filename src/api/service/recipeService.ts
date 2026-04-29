import {RecipeDTO, AddRecipeRequest} from "../types";
import {get, post} from "../client";

class RecipeService {

    async getAllRecipes(): Promise<RecipeDTO[]> {
        return get<RecipeDTO[]>("/recipe");
    }

    async addRecipe(request: AddRecipeRequest): Promise<RecipeDTO> {
        return post<RecipeDTO>("/recipe", request);
    }

}

const recipeService = new RecipeService();

export {recipeService}
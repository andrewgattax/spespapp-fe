import {RecipeDTO, AddRecipeRequest} from "../types";
import {get, post} from "../client";

class RecipeService {

    private async getAllRecipes(): Promise<RecipeDTO[]> {
        return get<RecipeDTO[]>("/auth/recipe");
    }

    private async addRecipe(request: AddRecipeRequest): Promise<RecipeDTO> {
        return post<RecipeDTO>("/auth/recipe", request);
    }

}
import React, {useState, useCallback, useEffect, useMemo} from "react";
import {View, ScrollView, StyleSheet, Text} from "react-native";
import {useTheme} from "@/hooks/use-theme";
import {useGlobalStyles} from "@/hooks/use-global-style";
import {SubPageHeaderActions} from "@/components/subpage-header-actions";
import {MaterialIcons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useLocalSearchParams} from "expo-router";
import {recipeService, ApiError, RecipeDTO} from "@/api";
import {Spacing} from "@/constants/theme";
import {Button} from "@/components/button";
import {RecipeCard} from "./recipe-card";
import {SkeletonTitle, SkeletonSubtitle, SkeletonRecipeCard} from "@/components/skeleton";
import {BottomButton} from "@/components/bottom-button";

function prettifyName(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function RecipeDetail() {
  const { name } = useLocalSearchParams();
  const theme = useTheme();
  const globalStyles = useGlobalStyles();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipe, setRecipe] = useState<RecipeDTO | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!name || typeof name !== 'string') {
      setError("Nome ricetta non valido");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const decodedName = decodeURIComponent(name);
      const response = await recipeService.getRecipeByName(decodedName);
      setRecipe(response);
    } catch (e) {
      console.error("Failed to load recipe", e);
      if (e instanceof ApiError) {
        setError(e.payload.message);
      } else {
        setError(e instanceof Error ? e.message : "Impossibile caricare la ricetta");
      }
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.text,
      marginBottom: Spacing.two,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textMuted,
      marginBottom: Spacing.four,
    },
    ingredientsTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      marginBottom: Spacing.three,
      marginTop: Spacing.two,
    },
  }), [theme]);

  return (
    <>
      <SubPageHeaderActions
        actions={[
          {
            icon: <MaterialIcons name="edit" size={24} color={theme.text} />,
            onPress: () => {
              // TODO: Implement edit functionality
              console.log('Edit recipe with name:', name);
            },
          },
          {
            icon: <MaterialIcons name="delete" size={24} color={theme.destructive} />,
            onPress: () => {
              // TODO: Implement delete functionality
              console.log('Delete recipe with name:', name);
            },
          },
        ]}
      />
      <View style={globalStyles.pageContainer}>
        {/*sos*/}
        {loading ? (
          <View>
            <SkeletonTitle />
            <SkeletonSubtitle />
            <View style={{gap: Spacing.two, marginTop: Spacing.two}}>
              <SkeletonRecipeCard />
              <SkeletonRecipeCard />
              <SkeletonRecipeCard />
              <SkeletonRecipeCard />
            </View>
          </View>
        ) : error ? (
          <View style={{padding: Spacing.four, alignItems: 'center', marginTop: Spacing.eight}}>
            <MaterialCommunityIcons name="alert-circle" size={64} color={theme.destructive} />
            <Text style={{color: theme.destructive, marginBottom: Spacing.three, marginTop: Spacing.three, textAlign: 'center'}}>
              {error}
            </Text>
            <Button
              title="Riprova"
              onPress={loadRecipe}
              variant="outlined"
            />
          </View>
        ) : recipe ? (
          <>
            <Text style={styles.title}>
              {prettifyName(recipe.name)}
            </Text>
            <Text style={styles.subtitle}>
              {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 'i' : 'e'}
            </Text>
            <ScrollView style={{flex: 1}} bounces={false}>
              <View style={{gap: Spacing.two}}>
                {recipe.ingredients.map((ingredient) => (
                  <RecipeCard
                    key={ingredient.id}
                    text={prettifyName(ingredient.name)}
                  />
                ))}
              </View>
            </ScrollView>

          </>
        ) : null}
      </View>
      <BottomButton
        title="Aggiungi alla lista"
        icon={<MaterialCommunityIcons name="plus" size={28} color="#FFF" />}
        primaryColor={theme.accent}
        onPress={() => {
          // TODO: Implement add ingredient functionality
          console.log('Add ingredient');
        }}
      />
    </>
  );
}

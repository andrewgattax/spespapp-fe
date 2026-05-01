import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {Pressable, View, StyleSheet, TextInput, Keyboard, Text} from "react-native";
import {useTheme} from "@/hooks/use-theme";
import {useGlobalStyles} from "@/hooks/use-global-style";
import {Spacing} from "@/constants/theme";
import {PageHeader} from "@/components/page-header";
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";
import {ButtonCard, ButtonCardGroup, ButtonCardSkeleton} from "@/components/button-card";
import {Button} from "@/components/button";
import {ApiError, RecipeDTO, recipeService} from "@/api";
import {AnimatedRefreshControl} from "@/components/animated-refresh-control";
import {router} from "expo-router";


function Recipes() {

  const theme = useTheme()
  const globalStyles = useGlobalStyles()
  const styles = useMemo(() => StyleSheet.create({
    inputWrapper: {
      paddingHorizontal: Spacing.three,
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      shadowColor: "#000",
      borderRadius: Spacing.four,
      backgroundColor: theme.textSecondary + 20,
      borderWidth: 1,
      borderColor: theme.textMuted + '30',
    },
    inputContainer: {
      gap: Spacing.two
    },
    inputLabel: {
      color: theme.textMuted + 90,
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 14
    },
    input: {
      width: "100%",
      fontSize: Spacing.two + 6,
      paddingVertical: Spacing.three,
      paddingLeft: Spacing.two,
      borderRadius: 12,
    }

  }), [theme])
  const [searchFilter, setSearchFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recipes, setRecipes] = useState<RecipeDTO[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeDTO[]>([])

  const loadRecipes = useCallback(async () => {
    try {
      setError("");
      const response = await recipeService.getAllRecipes()
      setRecipes(response)
      setFilteredRecipes(response)
    } catch (e) {
      console.error("Failed to load recipes", e)
      if (e instanceof ApiError) {
        setError(e.payload.message);
      } else {
        setError(e instanceof Error ? e.message : "Impossibile caricare le ricette");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRefresh = useCallback(async () => {
    setError("");
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  }, [loadRecipes]);

  useEffect(() => {
    if(searchFilter.trim() === "") {
      setFilteredRecipes(recipes)
    } else {
      const lowerSearch = searchFilter.toLowerCase();
      setFilteredRecipes(recipes.filter(r => r.name.toLowerCase().includes(lowerSearch)))
    }
  }, [searchFilter]);

  return (
    <Pressable style={{flex: 1}} onPress={Keyboard.dismiss}>
      <PageHeader
      title={"Ricette"}
      subtitle={"Ma che cazzo ci mangiamo"}
      icon={<Feather name="plus" size={24} color={theme.accent}/>}
      iconBorderColor={theme.accent + 30}
      iconBackgroundColor={theme.accent + 10}
      >
        <View style={styles.inputWrapper}>
          <Feather name={"search"} size={18} color={theme.textMuted}/>
          <TextInput
            style={styles.input}
            value={searchFilter}
            onChangeText={setSearchFilter}
            placeholderTextColor={theme.textMuted + 50}
            placeholder="Dico davvero"
            autoCapitalize="none"
          />
        </View>
      </PageHeader>
      <View style={globalStyles.pageContainer}>
      <AnimatedRefreshControl
        onRefresh={handleRefresh}
        refreshing={refreshing}
      >
        {loading ? (
          <ButtonCardGroup>
            {Array.from({ length: 4 }).map((_, index) => (
              <ButtonCardSkeleton key={`skeleton-${index}`} />
            ))}
          </ButtonCardGroup>
        ) : error ? (
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
        ) : filteredRecipes.length === 0 ? (
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
          <ButtonCardGroup>
            {filteredRecipes.map(recipe => (
              <ButtonCard
                icon={<MaterialCommunityIcons name="food-halal" size={24} color={theme.accent}/>}
                text={recipe.name.charAt(0).toUpperCase() + recipe.name.slice(1)}
                fontWeight={"800"}
                subtitle={`${recipe.ingredients.length} ingredienti`}
                showArrow
                iconBackgroundColor={theme.accent + 10}
                onPress={() => router.push(`/recipe-detail/${encodeURIComponent(recipe.name)}`)} />
            ))}
          </ButtonCardGroup>
        )}
      </AnimatedRefreshControl>
      </View>
    </Pressable>
  );
}

export default Recipes;
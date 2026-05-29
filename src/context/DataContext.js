import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem('Recipes');
      const storedGroups = await AsyncStorage.getItem('Groups');
      
      if (storedRecipes) setRecipes(JSON.parse(storedRecipes));
      if (storedGroups) setGroups(JSON.parse(storedGroups));
    } catch (error) {
      console.error('Error loading app data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Recipes ---
  const addRecipe = async (recipeData) => {
    const newRecipe = {
      id: Date.now().toString(),
      ...recipeData,
      createdBy: currentUser?.email || '', // using email as ID (guard if null)
      createdAt: new Date().toISOString(),
    };
    const updated = [...recipes, newRecipe];
    setRecipes(updated);
    await AsyncStorage.setItem('Recipes', JSON.stringify(updated));
  };

  const updateRecipe = async (id, recipeData) => {
    const updated = recipes.map(r => r.id === id ? { ...r, ...recipeData } : r);
    setRecipes(updated);
    await AsyncStorage.setItem('Recipes', JSON.stringify(updated));
  };

  const deleteRecipe = async (id) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    await AsyncStorage.setItem('Recipes', JSON.stringify(updated));
  };

  // --- Groups ---
  const addGroup = async (groupData) => {
    const newGroup = {
      id: Date.now().toString(),
      ...groupData,
      createdBy: currentUser?.email || '',
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    await AsyncStorage.setItem('Groups', JSON.stringify(updated));
  };

  const updateGroup = async (id, groupData) => {
    const updated = groups.map(g => g.id === id ? { ...g, ...groupData } : g);
    setGroups(updated);
    await AsyncStorage.setItem('Groups', JSON.stringify(updated));
  };

  const deleteGroup = async (groupId) => {
    // Cuando se borra un grupo, el usuario me indicó:
    // "si un usuario borra un grupo, se borran por completo de la app las recetas asociadas a ese grupo, siempre y cuando la receta haya sido creada por el usuario que la está borrando, sino solo se elimina la relación con el grupo"

    const groupToDelete = groups.find(g => g.id === groupId);
    if (!groupToDelete) return;

    // Actualizamos las recetas
    const updatedRecipes = recipes.filter(recipe => {
      // Si la receta pertenece a este grupo
      if (recipe.groupIds && recipe.groupIds.includes(groupId)) {
        // Si el creador de la receta es el mismo que está borrando (currentUser)
        if (recipe.createdBy === currentUser?.email) {
          // Se borra por completo (filter out)
          return false; 
        }
      }
      return true;
    }).map(recipe => {
      // Para las que quedan, quitamos la relación con el grupo
      if (recipe.groupIds && recipe.groupIds.includes(groupId)) {
        return {
          ...recipe,
          groupIds: recipe.groupIds.filter(gId => gId !== groupId)
        };
      }
      return recipe;
    });

    const updatedGroups = groups.filter(g => g.id !== groupId);

    setRecipes(updatedRecipes);
    setGroups(updatedGroups);

    await AsyncStorage.setItem('Recipes', JSON.stringify(updatedRecipes));
    await AsyncStorage.setItem('Groups', JSON.stringify(updatedGroups));
  };

  return (
    <DataContext.Provider value={{
      recipes,
      groups,
      isLoading,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      addGroup,
      updateGroup,
      deleteGroup
    }}>
      {children}
    </DataContext.Provider>
  );
};

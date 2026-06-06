import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../api/client';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setRecipes([]);
      setGroups([]);
    }
  }, [currentUser]);

  const isLocalFileUri = (value) =>
    typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://'));

  const toAbsolutePhotoUrl = (value) => {
    if (!value || typeof value !== 'string') return value;
    if (value.startsWith('/')) {
      return `${apiClient.defaults.baseURL}${value}`;
    }
    return value;
  };

  const uploadRecipePhoto = async (recipeId, photoUri) => {
    const extension = photoUri.split('.').pop()?.toLowerCase();
    const mimeType = extension ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      name: `recipe-${Date.now()}.${extension || 'jpg'}`,
      type: mimeType,
    });

    await apiClient.put(`/recipes/${recipeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const mapBackendRecipeToFrontend = (backendRecipe) => {
    return {
      id: backendRecipe.recipe_id?.toString(),
      title: backendRecipe.title,
      photo: toAbsolutePhotoUrl(backendRecipe.image_url),
      description: backendRecipe.description,
      observations: backendRecipe.description,
      prepTime: backendRecipe.prep_time_minutes || '',
      difficulty: backendRecipe.difficulty || 'Media',
      ingredients: (backendRecipe.ingredients || [])
        .map(i => `${i.quantity || ''} ${i.unit || ''} ${i.name}`.trim())
        .join('\n'),
      steps: (backendRecipe.steps || [])
        .sort((a, b) => a.step_number - b.step_number)
        .map(s => s.instruction)
        .join('\n'),
      groupIds: (backendRecipe.groups || []).map(g => g.group_id?.toString()),
      createdBy: backendRecipe.author_email || (backendRecipe.author_id?.toString() === currentUser?.id ? currentUser?.email : backendRecipe.author_id?.toString()),
      isPublic: backendRecipe.is_public,
    };
  };

  const parseIngredients = (ingredientsStr) => {
    if (!ingredientsStr) return [];
    return ingredientsStr
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line) => ({ name: line }));
  };

  const parseSteps = (stepsStr) => {
    if (!stepsStr) return [];
    return stepsStr
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line, index) => ({
        step_number: index + 1,
        instruction: line,
      }));
  };

  const getErrorMessage = (error, fallbackMessage) => {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.normalizedMessage) return error.normalizedMessage;
    return fallbackMessage;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [generalRecipesRes, personalRecipesRes, groupsRes] = await Promise.all([
        apiClient.get('/recipes/general'),
        apiClient.get('/recipes/personal'),
        apiClient.get('/groups'),
      ]);

      const allRecipesMap = new Map();
      [...(generalRecipesRes.data || []), ...(personalRecipesRes.data || [])].forEach((r) => {
        allRecipesMap.set(r.recipe_id?.toString(), mapBackendRecipeToFrontend(r));
      });
      setRecipes(Array.from(allRecipesMap.values()));

      const mappedGroups = (groupsRes.data || []).map((g) => ({
        id: g.group_id?.toString(),
        name: g.name,
        description: g.description,
        createdBy: g.owner_id?.toString() === currentUser?.id ? currentUser?.email : g.owner_id?.toString(),
      }));
      setGroups(mappedGroups);
    } catch (error) {
      console.error('Error loading app data from backend', getErrorMessage(error, error));
    } finally {
      setIsLoading(false);
    }
  };

  const buildRecipePayload = (recipeData) => {
    const payload = {
      title: recipeData.title,
      is_public: recipeData.isPublic !== undefined ? recipeData.isPublic : true,
    };

    if (recipeData.photo && !isLocalFileUri(recipeData.photo)) {
      payload.image_url = recipeData.photo;
    }
    if (recipeData.observations) {
      payload.description = recipeData.observations;
    }

    const prepTimeText = (recipeData.prepTime || '').trim();
    if (prepTimeText) {
      payload.prep_time_minutes = prepTimeText;
    }

    if (recipeData.difficulty) {
      payload.difficulty = recipeData.difficulty;
    }

    const ingredients = parseIngredients(recipeData.ingredients);
    if (ingredients.length > 0) {
      payload.ingredients = ingredients;
    }

    const steps = parseSteps(recipeData.steps);
    if (steps.length > 0) {
      payload.steps = steps;
    }

    return payload;
  };

  const addRecipe = async (recipeData) => {
    try {
      const payload = buildRecipePayload(recipeData);
      const res = await apiClient.post('/recipes', payload);
      const newRecipeId = res.data.recipe_id || res.data.id;

      if (newRecipeId && isLocalFileUri(recipeData.photo)) {
        await uploadRecipePhoto(newRecipeId, recipeData.photo);
      }

      if (recipeData.groupIds && recipeData.groupIds.length > 0 && newRecipeId) {
        for (const groupId of recipeData.groupIds) {
          await apiClient.post(`/recipes/${newRecipeId}/groups/${groupId}`).catch((e) => console.error(e));
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error adding recipe', getErrorMessage(error, error));
      throw error;
    }
  };

  const updateRecipe = async (id, recipeData) => {
    try {
      const isOnlyGroupUpdate =
        Object.keys(recipeData).length === 1 &&
        Array.isArray(recipeData.groupIds);

      if (!isOnlyGroupUpdate) {
        const payload = buildRecipePayload(recipeData);
        await apiClient.put(`/recipes/${id}`, payload);

        if (isLocalFileUri(recipeData.photo)) {
          await uploadRecipePhoto(id, recipeData.photo);
        }
      }

      if (recipeData.groupIds) {
        const prevRecipe = recipes.find((r) => r.id === id);
        const prevGroupIds = prevRecipe?.groupIds || [];
        const newGroupIds = recipeData.groupIds;

        const toAdd = newGroupIds.filter((g) => !prevGroupIds.includes(g));
        const toRemove = prevGroupIds.filter((g) => !newGroupIds.includes(g));

        for (const gId of toAdd) {
          await apiClient.post(`/recipes/${id}/groups/${gId}`).catch(() => null);
        }
        for (const gId of toRemove) {
          await apiClient.delete(`/recipes/${id}/groups/${gId}`).catch(() => null);
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error updating recipe', getErrorMessage(error, error));
      throw error;
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await apiClient.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting recipe', getErrorMessage(error, error));
      throw error;
    }
  };

  const addGroup = async (groupData) => {
    try {
      await apiClient.post('/groups', {
        name: groupData.name,
        description: groupData.description,
      });
      await loadData();
    } catch (error) {
      console.error('Error adding group', getErrorMessage(error, error));
      throw error;
    }
  };

  const updateGroup = async (id, groupData) => {
    try {
      await apiClient.put(`/groups/${id}`, {
        name: groupData.name,
        description: groupData.description,
      });
      await loadData();
    } catch (error) {
      console.error('Error updating group', getErrorMessage(error, error));
      throw error;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await apiClient.delete(`/groups/${groupId}`);
      await loadData();
    } catch (error) {
      console.error('Error deleting group', getErrorMessage(error, error));
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        recipes,
        groups,
        isLoading,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addGroup,
        updateGroup,
        deleteGroup,
        loadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

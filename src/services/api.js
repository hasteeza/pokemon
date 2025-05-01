/**
 * API service for interacting with json-server
 */

// ✅ Use environment variable for flexibility across environments
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

// Team operations
export const fetchTeams = async () => {
  try {
    const response = await fetch(`${API_URL}/teams`)
    if (!response.ok) throw new Error("Failed to fetch teams")
    return await response.json()
  } catch (error) {
    console.error("Error fetching teams:", error)
    return []
  }
}

export const createTeam = async (team) => {
  try {
    const response = await fetch(`${API_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(team),
    })
    if (!response.ok) throw new Error("Failed to create team")
    return await response.json()
  } catch (error) {
    console.error("Error creating team:", error)
    throw error
  }
}

export const updateTeam = async (teamId, team) => {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(team),
    })
    if (!response.ok) throw new Error("Failed to update team")
    return await response.json()
  } catch (error) {
    console.error("Error updating team:", error)
    throw error
  }
}

export const deleteTeam = async (teamId) => {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete team")
    return true
  } catch (error) {
    console.error("Error deleting team:", error)
    throw error
  }
}

// Favorites operations
export const fetchFavorites = async () => {
  try {
    const response = await fetch(`${API_URL}/favorites`)
    if (!response.ok) throw new Error("Failed to fetch favorites")
    return await response.json()
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return []
  }
}

export const addFavorite = async (pokemon) => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pokemon),
    })
    if (!response.ok) throw new Error("Failed to add favorite")
    return await response.json()
  } catch (error) {
    console.error("Error adding favorite:", error)
    throw error
  }
}

export const removeFavorite = async (pokemonId) => {
  try {
    const response = await fetch(`${API_URL}/favorites/${pokemonId}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to remove favorite")
    return true
  } catch (error) {
    console.error("Error removing favorite:", error)
    throw error
  }
}

// Battle operations
export const fetchBattles = async () => {
  try {
    const timestamp = new Date().getTime()
    const response = await fetch(`${API_URL}/battles?_=${timestamp}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
    if (!response.ok) throw new Error(`Failed to fetch battles: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Error fetching battles:", error)
    throw error
  }
}

export const saveBattle = async (battleData) => {
  try {
    const response = await fetch(`${API_URL}/battles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify(battleData),
    })
    if (!response.ok) throw new Error(`Failed to save battle: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Error saving battle:", error)
    throw error
  }
}

export const deleteBattleById = async (battleId) => {
  try {
    console.log(`Attempting to delete battle with ID: ${battleId}`)

    try {
      const checkResponse = await fetch(`${API_URL}/battles/${battleId}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (checkResponse.status === 404) {
        console.log(`Battle with ID ${battleId} not found, considering it already deleted`)
        return true
      }
    } catch (checkError) {
      console.log(`Error checking if battle ${battleId} exists:`, checkError)
    }

    const response = await fetch(`${API_URL}/battles/${battleId}`, {
      method: "DELETE",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Battle with ID ${battleId} not found during deletion, considering it already deleted`)
        return true
      }
      throw new Error(`Failed to delete battle: ${response.statusText}`)
    }

    console.log(`Successfully deleted battle with ID: ${battleId}`)
    return true
  } catch (error) {
    console.error(`Error deleting battle with ID ${battleId}:`, error)
    if (error.message && error.message.includes("Not Found")) {
      return true
    }
    throw error
  }
}

export const deleteBattle = async () => {
  try {
    const battles = await fetchBattles()
    for (const battle of battles) {
      await deleteBattleById(battle.id)
    }
    return true
  } catch (error) {
    console.error("Error deleting all battles:", error)
    throw error
  }
}

// PokéAPI v2 operations
export const POKE_API_URL = "https://pokeapi.co/api/v2"

export const fetchPokemonList = async (limit = 12, offset = 0) => {
  try {
    const response = await fetch(`${POKE_API_URL}/pokemon?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error("Failed to fetch Pokémon list")
    return await response.json()
  } catch (error) {
    console.error("Error fetching Pokémon list:", error)
    throw error
  }
}

export const fetchPokemonByType = async (type) => {
  try {
    const response = await fetch(`${POKE_API_URL}/type/${type}`)
    if (!response.ok) throw new Error(`Failed to fetch Pokémon of type ${type}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching Pokémon of type ${type}:`, error)
    throw error
  }
}

export const fetchPokemonByGeneration = async (generation) => {
  try {
    const response = await fetch(`${POKE_API_URL}/generation/${generation}`)
    if (!response.ok) throw new Error(`Failed to fetch Pokémon of generation ${generation}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching Pokémon of generation ${generation}:`, error)
    throw error
  }
}

export const fetchPokemonDetail = async (idOrName) => {
  try {
    const response = await fetch(`${POKE_API_URL}/pokemon/${idOrName}`)
    if (!response.ok) throw new Error(`Failed to fetch Pokémon ${idOrName}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching Pokémon ${idOrName}:`, error)
    throw error
  }
}

export const fetchPokemonSpecies = async (idOrName) => {
  try {
    const response = await fetch(`${POKE_API_URL}/pokemon-species/${idOrName}`)
    if (!response.ok) throw new Error(`Failed to fetch Pokémon species ${idOrName}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching Pokémon species ${idOrName}:`, error)
    throw error
  }
}

export const fetchEvolutionChain = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch evolution chain")
    return await response.json()
  } catch (error) {
    console.error("Error fetching evolution chain:", error)
    throw error
  }
}

export const fetchTypeDetails = async (type) => {
  try {
    const response = await fetch(`${POKE_API_URL}/type/${type}`)
    if (!response.ok) throw new Error(`Failed to fetch type details for ${type}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching type details for ${type}:`, error)
    throw error
  }
}

export const fetchGenerations = async () => {
  try {
    const response = await fetch(`${POKE_API_URL}/generation`)
    if (!response.ok) throw new Error("Failed to fetch generations")
    return await response.json()
  } catch (error) {
    console.error("Error fetching generations:", error)
    throw error
  }
}

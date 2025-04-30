import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PokemonList from "./components/PokemonList";
import PokemonDetailV2 from "./components/PokemonDetail"; // Import the correct component
import TeamManager from "./components/TeamManager";
import TeamDetail from "./components/TeamDetail";
import BattleArena from "./components/BattleArena";
import BattleHistory from "./components/BattleHistory";
import FavoritesList from "./components/FavoritesList";
import Loading from "./components/Loading";
import ScrollToTop from "./components/ScrollToTop";
import {
  fetchTeams,
  createTeam as apiCreateTeam,
  updateTeam,
  deleteTeam as apiDeleteTeam,
} from "./services/api";
import { fetchFavorites, addFavorite, removeFavorite } from "./services/api";
import "./App.css";
import "./index.css";

function App() {
  const [teams, setTeams] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {}, []);

  // Load teams and favorites on initial load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch teams
        const teamsData = await fetchTeams();
        setTeams(teamsData);

        // Fetch favorites
        const favoritesData = await fetchFavorites();
        setFavorites(favoritesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a new team
  const createTeam = async (teamName) => {
    const newTeam = {
      name: teamName,
      pokemon: [],
    };

    try {
      // Save to server and get created team with id
      const createdTeam = await apiCreateTeam(newTeam);

      // Update state
      setTeams((prevTeams) => [...prevTeams, createdTeam]);

      return true;
    } catch (error) {
      console.error("Error creating team:", error);
      return false;
    }
  };

  // Rename a team
  const renameTeam = async (teamId, newName) => {
    // Find the team to update
    const teamToUpdate = teams.find((team) => team.id === teamId);
    if (!teamToUpdate) return false;

    const updatedTeam = { ...teamToUpdate, name: newName };

    try {
      // Update on server
      await updateTeam(teamId, updatedTeam);

      // Update state
      setTeams((prevTeams) =>
        prevTeams.map((team) => (team.id === teamId ? updatedTeam : team))
      );

      return true;
    } catch (error) {
      console.error("Error renaming team:", error);
      return false;
    }
  };

  // Delete a team
  const deleteTeam = async (teamId) => {
    try {
      // Delete from server
      await apiDeleteTeam(teamId);

      // Update state
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));

      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      return false;
    }
  };

  // Add a Pokemon to a team (max 6)
  const addToTeam = async (teamId, pokemon) => {
    const team = teams.find((t) => t.id === teamId);

    if (!team) {
      alert("Team not found!");
      return false;
    }

    if (team.pokemon.length >= 6) {
      alert("This team is already full! (Max: 6 Pokémon)");
      return false;
    }

    // Check if Pokemon is already in team
    if (team.pokemon.some((p) => p.id === pokemon.id)) {
      alert(
        pokemon.name.charAt(0).toUpperCase() +
          pokemon.name.slice(1) +
          " is already in this team!"
      );
      return false;
    }

    const updatedTeam = {
      ...team,
      pokemon: [...team.pokemon, pokemon],
    };

    try {
      // Update on server
      await updateTeam(teamId, updatedTeam);

      // Update state
      setTeams((prevTeams) =>
        prevTeams.map((t) => (t.id === teamId ? updatedTeam : t))
      );

      return true;
    } catch (error) {
      console.error("Error updating team:", error);
      return false;
    }
  };

  // Remove a Pokemon from a team
  const removeFromTeam = async (teamId, pokemonId) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return false;

    const updatedTeam = {
      ...team,
      pokemon: team.pokemon.filter((p) => p.id !== pokemonId),
    };

    try {
      // Update on server
      await updateTeam(teamId, updatedTeam);

      // Update state
      setTeams((prevTeams) =>
        prevTeams.map((t) => (t.id === teamId ? updatedTeam : t))
      );

      return true;
    } catch (error) {
      console.error("Error updating team:", error);
      return false;
    }
  };

  // Toggle favorite status of a Pokemon
  const toggleFavorite = async (pokemon) => {
    const isFavorite = favorites.some((p) => p.id === pokemon.id);

    try {
      if (isFavorite) {
        // Remove from favorites
        await removeFavorite(pokemon.id);

        // Update state
        setFavorites((prevFavorites) =>
          prevFavorites.filter((p) => p.id !== pokemon.id)
        );
      } else {
        // Add to favorites
        await addFavorite(pokemon);

        // Update state
        setFavorites((prevFavorites) => [...prevFavorites, pokemon]);
      }
      return true;
    } catch (error) {
      console.error("Error updating favorites:", error);
      return false;
    }
  };

  // Check if a Pokemon is in favorites
  const isFavorite = (pokemonId) => {
    return favorites.some((p) => p.id === pokemonId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-secondary-900">
        <Loading />
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen w-full bg-secondary-900">
        <Navbar />
        <div className="flex-grow w-full pt-16">
          {" "}
          {/* Add padding-top to account for fixed navbar */}
          <Routes>
            <Route
              path="/"
              element={
                <PokemonList
                  addToTeam={addToTeam}
                  toggleFavorite={toggleFavorite}
                  isFavorite={isFavorite}
                  teams={teams}
                />
              }
            />
            <Route
              path="/pokemon/:id"
              element={
                <PokemonDetailV2
                  addToTeam={addToTeam}
                  toggleFavorite={toggleFavorite}
                  isFavorite={isFavorite}
                  teams={teams}
                />
              }
            />
            <Route
              path="/teams"
              element={
                <TeamManager
                  teams={teams}
                  createTeam={createTeam}
                  renameTeam={renameTeam}
                  deleteTeam={deleteTeam}
                />
              }
            />
            <Route
              path="/teams/:id"
              element={
                <TeamDetail
                  teams={teams}
                  removeFromTeam={removeFromTeam}
                  renameTeam={renameTeam}
                />
              }
            />
            <Route
              path="/battle"
              element={
                <TeamManager
                  teams={teams}
                  createTeam={createTeam}
                  renameTeam={renameTeam}
                  deleteTeam={deleteTeam}
                  battleMode={true}
                />
              }
            />
            <Route
              path="/battle/:teamId"
              element={<BattleArena teams={teams} />}
            />
            <Route path="/history" element={<BattleHistory />} />
            <Route
              path="/favorites"
              element={
                <FavoritesList
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  teams={teams}
                  addToTeam={addToTeam}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

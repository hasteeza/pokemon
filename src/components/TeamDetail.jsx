import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const TeamDetail = ({ teams, removeFromTeam, renameTeam }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const team = teams.find((t) => t.id === Number.parseInt(id) || t.id === id);

  useEffect(() => {
    // Reset selected Pokemon when team changes
    setSelectedPokemon(null);
  }, [id]);

  if (!team) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-white mb-6">Team not found</p>
        <button
          onClick={() => navigate("/teams")}
          className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  // Original Pokémon type colors from the games
  const typeColors = {
    normal: {
      bg: "bg-[#A8A77A]",
      text: "text-white",
      light: "bg-[#C6C6A7]",
      gradient: "from-[#A8A77A] to-[#C6C6A7]",
    },
    fire: {
      bg: "bg-[#EE8130]",
      text: "text-white",
      light: "bg-[#F5AC78]",
      gradient: "from-[#EE8130] to-[#F5AC78]",
    },
    water: {
      bg: "bg-[#6390F0]",
      text: "text-white",
      light: "bg-[#9DB7F5]",
      gradient: "from-[#6390F0] to-[#9DB7F5]",
    },
    electric: {
      bg: "bg-[#F7D02C]",
      text: "text-gray-800",
      light: "bg-[#FAE078]",
      gradient: "from-[#F7D02C] to-[#FAE078]",
    },
    grass: {
      bg: "bg-[#7AC74C]",
      text: "text-white",
      light: "bg-[#A7DB8D]",
      gradient: "from-[#7AC74C] to-[#A7DB8D]",
    },
    ice: {
      bg: "bg-[#96D9D6]",
      text: "text-gray-800",
      light: "bg-[#BCE6E6]",
      gradient: "from-[#96D9D6] to-[#BCE6E6]",
    },
    fighting: {
      bg: "bg-[#C22E28]",
      text: "text-white",
      light: "bg-[#D67873]",
      gradient: "from-[#C22E28] to-[#D67873]",
    },
    poison: {
      bg: "bg-[#A33EA1]",
      text: "text-white",
      light: "bg-[#C183C1]",
      gradient: "from-[#A33EA1] to-[#C183C1]",
    },
    ground: {
      bg: "bg-[#E2BF65]",
      text: "text-gray-800",
      light: "bg-[#EBD69D]",
      gradient: "from-[#E2BF65] to-[#EBD69D]",
    },
    flying: {
      bg: "bg-[#A98FF3]",
      text: "text-white",
      light: "bg-[#C6B7F5]",
      gradient: "from-[#A98FF3] to-[#C6B7F5]",
    },
    psychic: {
      bg: "bg-[#F95587]",
      text: "text-white",
      light: "bg-[#FA92B2]",
      gradient: "from-[#F95587] to-[#FA92B2]",
    },
    bug: {
      bg: "bg-[#A6B91A]",
      text: "text-white",
      light: "bg-[#C6D16E]",
      gradient: "from-[#A6B91A] to-[#C6D16E]",
    },
    rock: {
      bg: "bg-[#B6A136]",
      text: "text-white",
      light: "bg-[#D1C17D]",
      gradient: "from-[#B6A136] to-[#D1C17D]",
    },
    ghost: {
      bg: "bg-[#735797]",
      text: "text-white",
      light: "bg-[#A292BC]",
      gradient: "from-[#735797] to-[#A292BC]",
    },
    dragon: {
      bg: "bg-[#6F35FC]",
      text: "text-white",
      light: "bg-[#A27DFA]",
      gradient: "from-[#6F35FC] to-[#A27DFA]",
    },
    dark: {
      bg: "bg-[#705746]",
      text: "text-white",
      light: "bg-[#A29288]",
      gradient: "from-[#705746] to-[#A29288]",
    },
    steel: {
      bg: "bg-[#B7B7CE]",
      text: "text-gray-800",
      light: "bg-[#D1D1E0]",
      gradient: "from-[#B7B7CE] to-[#D1D1E0]",
    },
    fairy: {
      bg: "bg-[#D685AD]",
      text: "text-white",
      light: "bg-[#F4BDC9]",
      gradient: "from-[#D685AD] to-[#F4BDC9]",
    },
  };

  // Helper function to adjust color brightness
  const adjustColor = (color, amount) => {
    return (
      "#" +
      color
        .replace(/^#/, "")
        .replace(/../g, (color) =>
          (
            "0" +
            Math.min(
              255,
              Math.max(0, Number.parseInt(color, 16) + amount)
            ).toString(16)
          ).substr(-2)
        )
    );
  };

  // Get background gradient based on Pokémon's primary type
  const getTypeGradient = (type) => {
    const baseColor =
      typeColors[type]?.bg.replace("bg-[", "").replace("]", "") || "#7AC74C";
    return `linear-gradient(135deg, ${baseColor}, ${adjustColor(
      baseColor,
      40
    )})`;
  };

  const handleStartRename = () => {
    setNewName(team.name);
    setIsRenaming(true);
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("Please enter a team name");
      return;
    }
    renameTeam(team.id, newName);
    setIsRenaming(false);
  };

  const handlePokemonClick = (pokemonId) => {
    setSelectedPokemon(selectedPokemon === pokemonId ? null : pokemonId);
  };

  return (
    <div className="min-h-screen bg-secondary-900 relative px-4 py-6 w-full">
      <div className="absolute inset-0 z-0 opacity-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          <circle cx="50" cy="50" r="45" fill="white" />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="6"
          />
          <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="6" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 w-full">
          {isRenaming ? (
            <form
              onSubmit={handleRename}
              className="flex gap-2 items-center w-full sm:w-auto"
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-secondary-800 text-white max-w-full"
                maxLength={20}
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </form>
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center text-white truncate max-w-full">
              <span className="mr-2 truncate">{team.name}</span>
              <button
                onClick={handleStartRename}
                className="text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
                aria-label="Rename team"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </h1>
          )}

          <div className="flex gap-3 ml-auto flex-shrink-0">
            <div>
              <Link
                to="/teams"
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md flex items-center whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  />
                </svg>
                Back to Teams
              </Link>
            </div>

            {team.pokemon && team.pokemon.length >= 2 && (
              <div>
                <Link
                  to={`/battle/${team.id}`}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center whitespace-nowrap"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Battle
                </Link>
              </div>
            )}
          </div>
        </div>

        {team.pokemon && team.pokemon.length === 0 ? (
          <div className="bg-secondary-800 rounded-xl shadow-2xl p-10 text-center text-white col-span-full max-w-md mx-auto">
            <div className="mb-6 mx-auto w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <path d="M5,50 h90" stroke="currentColor" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Your team is empty!</h2>
            <p className="text-gray-400 mb-8">
              Browse the Pokédex and add some Pokémon to your team.
            </p>
            <div>
              <Link
                to="/"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg inline-block"
              >
                Go to Pokédex
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.pokemon &&
              team.pokemon.map((pokemon) => {
                const primaryType = pokemon.types[0].type.name;
                const typeGradient = getTypeGradient(primaryType);
                const isSelected = selectedPokemon === pokemon.id;

                return (
                  <div
                    key={pokemon.id}
                    className={`bg-secondary-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-offset-4 ring-offset-secondary-900"
                        : ""
                    }`}
                    style={{
                      ringColor: typeColors[primaryType]?.bg.replace("bg-", "")
                        ? typeColors[primaryType].bg
                            .replace("bg-[", "")
                            .replace("]", "")
                        : "#FFFFFF",
                    }}
                    onClick={() => handlePokemonClick(pokemon.id)}
                  >
                    <div
                      className="p-4 flex justify-center relative"
                      style={{ background: typeGradient }}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          className="w-full h-full"
                        >
                          <circle cx="50" cy="50" r="25" fill="white" />
                          <circle
                            cx="50"
                            cy="50"
                            r="20"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          />
                          <line
                            x1="20"
                            y1="50"
                            x2="80"
                            y2="50"
                            stroke="white"
                            strokeWidth="3"
                          />
                          <circle cx="50" cy="50" r="8" fill="white" />
                        </svg>
                      </div>

                      <img
                        src={
                          pokemon.sprites.other["official-artwork"]
                            .front_default || pokemon.sprites.front_default
                        }
                        alt={pokemon.name}
                        className="h-40 w-40 object-contain drop-shadow-lg z-10"
                      />
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-bold text-white capitalize truncate">
                          {pokemon.name}
                        </h2>
                        <span className="text-gray-400 font-semibold flex-shrink-0 ml-2">
                          #{pokemon.id.toString().padStart(3, "0")}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-4 flex-wrap">
                        {pokemon.types.map((typeInfo) => (
                          <span
                            key={typeInfo.type.name}
                            className={`${
                              typeColors[typeInfo.type.name]?.bg ||
                              "bg-gray-500"
                            } ${
                              typeColors[typeInfo.type.name]?.text ||
                              "text-white"
                            } text-xs px-3 py-1 rounded-full capitalize flex items-center`}
                          >
                            {typeInfo.type.name}
                          </span>
                        ))}
                      </div>

                      {isSelected && (
                        <div className="mb-4">
                          <h4 className="text-white text-sm font-semibold mb-2">
                            Abilities:
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {pokemon.abilities.map((ability, index) => (
                              <span
                                key={index}
                                className="text-xs bg-secondary-700 text-gray-300 px-2 py-1 rounded capitalize"
                              >
                                {ability.ability.name.replace("-", " ")}
                                {ability.is_hidden && " (Hidden)"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <h4 className="text-white text-sm font-semibold mb-2">
                          Base Stats:
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {pokemon.stats.slice(0, 6).map((stat, index) => (
                            <div key={stat.stat.name} className="text-center">
                              <div className="text-xs text-gray-400 capitalize truncate">
                                {stat.stat.name.replace("-", " ")}
                              </div>
                              <div className="text-white font-medium">
                                {stat.base_stat}
                              </div>
                              <div className="w-full bg-secondary-700 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full ${typeColors[primaryType]?.bg}`}
                                  style={{
                                    width: `${(stat.base_stat / 255) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-between mt-4">
                        <div>
                          <Link
                            to={`/pokemon/${pokemon.id}`}
                            className="bg-secondary-700 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-md"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Details
                          </Link>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromTeam(team.id, pokemon.id);
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 shadow-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;

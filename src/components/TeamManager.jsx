import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Edit,
  Trash2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const TeamManager = ({
  teams,
  createTeam,
  renameTeam,
  deleteTeam,
  battleMode = false,
}) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    const result = await createTeam(newTeamName);
    if (result) {
      setNewTeamName("");
      setIsCreating(false);
      setError(null);
    } else {
      setError("Failed to create team. Please try again.");
    }
  };

  const handleStartRename = (team) => {
    setEditingTeamId(team.id);
    setEditedTeamName(team.name);
    setError(null);
  };

  const handleRename = async (e, teamId) => {
    e.preventDefault();
    if (!editedTeamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    const result = await renameTeam(teamId, editedTeamName);
    if (result) {
      setEditingTeamId(null);
      setError(null);
    } else {
      setError("Failed to rename team. Please try again.");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      const result = await deleteTeam(teamId);
      if (!result) {
        setError("Failed to delete team. Please try again.");
      }
    }
  };

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

  return (
    <div
      className="min-h-screen bg-gray-900 text-white p-4 sm:p-6"
      data-aos="fade-up"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {battleMode ? "Select a Team to Battle" : "Team Manager"}
          </h1>
          <p className="text-red-100">
            Manage your Pokémon teams and prepare for battle
          </p>
        </div>

        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-white p-4 rounded-md mb-6 flex items-center">
            <AlertCircle className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!battleMode && (
          <div className="bg-secondary-800 rounded-lg shadow-lg p-6 mb-6 transition-all">
            {isCreating ? (
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                  Create a New Team
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name..."
                    className="flex-grow px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    maxLength={20}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Create Team
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewTeamName("");
                        setError(null);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full bg-secondary-800 hover:bg-secondary-700 text-white p-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle size={20} />
                <span>Create a New Team</span>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-secondary-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl card-hover"
            >
              {editingTeamId === team.id ? (
                <div className="p-4 bg-secondary-700">
                  <form
                    onSubmit={(e) => handleRename(e, team.id)}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={editedTeamName}
                      onChange={(e) => setEditedTeamName(e.target.value)}
                      className="flex-grow px-3 py-1 bg-secondary-600 border border-secondary-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                      maxLength={20}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeamId(null);
                        setError(null);
                      }}
                      className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-red-700 to-red-900 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{team.name}</h3>
                      {!battleMode && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartRename(team)}
                            className="text-white hover:text-yellow-200 transition-colors"
                            aria-label="Rename team"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-white hover:text-yellow-200 transition-colors"
                            aria-label="Delete team"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium">
                        {team.pokemon?.length || 0} / 6 Pokémon
                      </span>
                      <div className="w-32 bg-secondary-700 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ((team.pokemon?.length || 0) / 6) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {team.pokemon && team.pokemon.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {team.pokemon.slice(0, 6).map((pokemon) => {
                          const primaryType = pokemon.types[0].type.name;
                          const typeGradient = `linear-gradient(135deg, ${typeColors[
                            primaryType
                          ]?.bg
                            .replace("bg-[", "")
                            .replace("]", "")}, ${adjustColor(
                            typeColors[primaryType]?.bg
                              .replace("bg-[", "")
                              .replace("]", ""),
                            40
                          )})`;

                          return (
                            <div
                              key={pokemon.id}
                              className="rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 bg-secondary-800"
                              data-aos="fade-up"
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
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="25"
                                      fill="white"
                                    />
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
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="8"
                                      fill="white"
                                    />
                                  </svg>
                                </div>

                                <img
                                  src={
                                    pokemon.sprites.other["official-artwork"]
                                      .front_default ||
                                    pokemon.sprites.front_default
                                  }
                                  alt={pokemon.name}
                                  className="h-20 w-20 object-contain drop-shadow-lg z-10"
                                />
                              </div>

                              <div className="p-4">
                                <h4 className="text-white font-semibold truncate capitalize">
                                  {pokemon.name}
                                </h4>
                                <span className="text-gray-400 text-sm font-semibold">
                                  #{pokemon.id.toString().padStart(3, "0")}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm mb-4">
                        No Pokémon in this team yet.
                      </p>
                    )}

                    <div className="flex justify-between">
                      {!battleMode ? (
                        <Link
                          to={`/teams/${team.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                          View Team
                        </Link>
                      ) : (
                        <Link
                          to={`/teams/${team.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                          View Team
                        </Link>
                      )}
                      {team.pokemon && team.pokemon.length >= 2 && (
                        <Link
                          to={`/battle/${team.id}`}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors flex items-center"
                        >
                          {battleMode ? (
                            <>
                              Select for Battle{" "}
                              <ChevronRight size={16} className="ml-1" />
                            </>
                          ) : (
                            "Battle"
                          )}
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="bg-secondary-800 rounded-lg shadow-lg p-8 text-center mt-6">
            <h2 className="text-xl mb-4">No teams created yet!</h2>
            <p className="text-gray-400 mb-6">
              Create your first team to start building your roster.
            </p>
            {!battleMode && !isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Create a Team
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManager;

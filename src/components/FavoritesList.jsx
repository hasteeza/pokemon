import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "./Icons";
import TeamSelector from "./TeamSelector";
import { motion } from "framer-motion";

const FavoritesList = ({ favorites, toggleFavorite, teams, addToTeam }) => {
  const [sortBy, setSortBy] = useState("id"); // Options: id, name, type
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isGridView, setIsGridView] = useState(true);

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
    unknown: {
      bg: "bg-gray-500",
      text: "text-white",
      light: "bg-gray-400",
      gradient: "from-gray-500 to-gray-400",
    },
  };

  // Get all unique types from favorite Pokémon
  const allTypes = Array.from(
    new Set(
      (favorites || []).flatMap((pokemon) =>
        (pokemon.types || []).map((typeInfo) => typeInfo.type.name)
      )
    )
  );

  // Type icons mapping
  const typeIcons = {
    normal: "🔄",
    fire: "🔥",
    water: "💧",
    electric: "⚡",
    grass: "🌿",
    ice: "❄️",
    fighting: "👊",
    poison: "☠️",
    ground: "🌍",
    flying: "🦅",
    psychic: "🔮",
    bug: "🐛",
    rock: "🪨",
    ghost: "👻",
    dragon: "🐉",
    dark: "🌑",
    steel: "⚙️",
    fairy: "✨",
    unknown: "❓",
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

  // Filter and sort favorites
  const filteredAndSortedFavorites = [...(favorites || [])]
    .filter((pokemon) => {
      // Apply search filter
      if (
        searchTerm &&
        !pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !pokemon.id.toString().includes(searchTerm)
      ) {
        return false;
      }

      // Apply type filter
      if (
        activeFilter !== "all" &&
        !(pokemon.types || []).some((t) => t.type.name === activeFilter)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "id") {
        return a.id - b.id;
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "type") {
        return (a.types?.[0]?.type.name || "").localeCompare(
          b.types?.[0]?.type.name || ""
        );
      }
      return 0;
    });

  const handleAddToTeam = (pokemon) => {
    if (teams.length === 0) {
      alert("You need to create a team first!");
      return;
    }

    setSelectedPokemon(pokemon);
    setShowTeamSelector(true);
  };

  const handleTeamSelect = (teamId) => {
    addToTeam(teamId, selectedPokemon);
    setShowTeamSelector(false);
    setSelectedPokemon(null);
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Stats name formatter
  const formatStatName = (statName) => {
    const statMap = {
      hp: "HP",
      attack: "ATK",
      defense: "DEF",
      "special-attack": "SP.ATK",
      "special-defense": "SP.DEF",
      speed: "SPD",
    };

    return statMap[statName] || statName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 relative px-4 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="bg-gradient-to-r from-red-600 to-red-500 rounded-full p-2 mr-3 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                  <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
                </svg>
              </span>
              My Favorite Pokémon
            </h1>
            <p className="text-gray-400">
              Manage your collection of favorite Pokémon
            </p>
          </div>

          <Link
            to="/"
            className="mt-4 md:mt-0 bg-gray-800 text-white px-5 py-2 rounded-full hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Pokédex
          </Link>
        </div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-xl p-12 text-center text-white max-w-2xl mx-auto border border-gray-700"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 md:h-16 md:w-16 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl mb-4 font-bold">
              You haven't added any favorites yet!
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Browse the Pokédex and click the heart icon to add Pokémon to your
              favorites collection.
            </p>
            <Link
              to="/"
              className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-full hover:from-red-700 hover:to-red-600 transition-colors text-lg font-medium inline-flex items-center shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Explore Pokédex
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Filter and Search Bar */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 mb-8 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder="Search by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-inner"
                  />
                </div>

                {/* Type filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Filter by type:
                  </label>
                  <div className="relative">
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-gray-700 border border-gray-600 text-white py-3 px-4 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-inner"
                    >
                      <option value="all">All Types</option>
                      {allTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Sort by:
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-gray-700 border border-gray-600 text-white py-3 px-4 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-inner"
                    >
                      <option value="id">ID (lowest first)</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="type">Type</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* View Toggle & Counter */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      <span className="text-red-500 font-bold">
                        {filteredAndSortedFavorites.length}
                      </span>
                      <span className="text-sm text-gray-400 ml-1">
                        of {favorites.length} Pokémon
                      </span>
                    </span>
                  </div>
                  <div className="flex bg-gray-700 p-1 rounded-xl mt-2 shadow-inner">
                    <button
                      onClick={() => setIsGridView(true)}
                      className={`flex-1 flex justify-center p-2 rounded-lg ${
                        isGridView
                          ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                          : "text-gray-400"
                      }`}
                      aria-label="Switch to grid view"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsGridView(false)}
                      className={`flex-1 flex justify-center p-2 rounded-lg ${
                        !isGridView
                          ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                          : "text-gray-400"
                      }`}
                      aria-label="Switch to list view"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty state if no matches */}
            {filteredAndSortedFavorites.length === 0 && (
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 text-center border border-gray-700 shadow-lg">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl text-white mb-2 font-bold">
                  No matching Pokémon found
                </h3>
                <p className="text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Grid View */}
            {isGridView ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6"
              >
                {filteredAndSortedFavorites.map((pokemon) => {
                  const primaryType =
                    pokemon.types?.[0]?.type.name || "unknown";
                  const typeGradient = getTypeGradient(primaryType);

                  return (
                    <motion.div
                      key={pokemon.id}
                      variants={itemVariants}
                      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 group"
                    >
                      <div
                        className="p-6 flex justify-center relative h-52"
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
                            pokemon.sprites?.other?.["official-artwork"]
                              ?.front_default ||
                            pokemon.sprites?.front_default ||
                            "https://via.placeholder.com/150?text=No+Image"
                          }
                          alt={pokemon.name}
                          className="h-40 w-40 object-contain drop-shadow-xl z-10 transform group-hover:scale-110 transition-transform duration-300"
                        />

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(pokemon);
                          }}
                          className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors z-20 group/btn"
                          aria-label="Remove from favorites"
                        >
                          <Heart
                            filled={true}
                            className="text-white group-hover/btn:scale-110 transition-transform"
                          />
                        </button>

                        <div className="absolute bottom-2 right-4 backdrop-blur-md bg-black/40 rounded-full px-3 py-1 text-white text-sm font-bold">
                          #
                          {pokemon.id !== undefined && pokemon.id !== null
                            ? pokemon.id.toString().padStart(3, "0")
                            : "???"}
                        </div>
                      </div>

                      <div className="p-5">
                        <h2 className="text-2xl font-bold text-white capitalize mb-2">
                          {pokemon.name}
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(pokemon.types || []).map((typeInfo) => (
                            <span
                              key={typeInfo.type.name}
                              className={`${
                                typeColors[typeInfo.type.name]?.bg ||
                                typeColors.unknown.bg
                              } ${
                                typeColors[typeInfo.type.name]?.text ||
                                typeColors.unknown.text
                              } text-xs px-3 py-1 rounded-full capitalize flex items-center shadow-sm`}
                            >
                              {typeIcons[typeInfo.type.name] ||
                                typeIcons.unknown}{" "}
                              <span className="ml-1">{typeInfo.type.name}</span>
                            </span>
                          ))}
                        </div>

                        <div className="mb-4">
                          <h4 className="text-white text-sm font-semibold mb-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Base Stats:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(pokemon.stats || []).slice(0, 6).map((stat) => (
                              <div key={stat.stat.name} className="text-center">
                                <div className="text-xs text-gray-400">
                                  {formatStatName(stat.stat.name)}
                                </div>
                                <div className="text-white font-bold">
                                  {stat.base_stat}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium text-sm hover:from-red-700 hover:to-red-600 transition-colors shadow-md"
                            onClick={() => handleAddToTeam(pokemon)}
                          >
                            Add to Team
                          </button>
                          <Link
                            to={`/pokemon/${pokemon.id}`}
                            className="flex-1 py-2 rounded-xl bg-gray-700 text-white text-center font-medium text-sm hover:bg-gray-600 transition-colors shadow-md"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              // List View
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {filteredAndSortedFavorites.map((pokemon) => {
                  const primaryType =
                    pokemon.types?.[0]?.type.name || "unknown";
                  const typeGradient = getTypeGradient(primaryType);

                  return (
                    <motion.div
                      key={pokemon.id}
                      variants={itemVariants}
                      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl border border-gray-700 transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div
                          className="p-4 w-full md:w-48 md:h-48 flex justify-center items-center relative"
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
                              pokemon.sprites?.other?.["official-artwork"]
                                ?.front_default ||
                              pokemon.sprites?.front_default ||
                              "https://via.placeholder.com/150?text=No+Image"
                            }
                            alt={pokemon.name}
                            className="h-28 w-28 object-contain drop-shadow-xl z-10 group-hover:scale-110 transition-transform duration-300"
                          />

                          <div className="absolute top-3 right-3 backdrop-blur-md bg-black/40 rounded-full px-3 py-1 text-white text-sm font-bold">
                            #
                            {pokemon.id !== undefined && pokemon.id !== null
                              ? pokemon.id.toString().padStart(3, "0")
                              : "???"}
                          </div>
                        </div>

                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex flex-wrap justify-between items-start mb-3">
                            <h2 className="text-xl md:text-2xl font-bold text-white capitalize mr-4">
                              {pokemon.name}
                            </h2>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(pokemon);
                                }}
                                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors z-20"
                                aria-label="Remove from favorites"
                              >
                                <Heart
                                  filled={true}
                                  className="text-red-500 hover:scale-110 transition-transform"
                                />
                              </button>
                              <button
                                onClick={() => handleAddToTeam(pokemon)}
                                className="text-sm py-1 px-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full hover:from-red-700 hover:to-red-600 shadow-md transition-colors"
                              >
                                Add to Team
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {(pokemon.types || []).map((typeInfo) => (
                              <span
                                key={typeInfo.type.name}
                                className={`${
                                  typeColors[typeInfo.type.name]?.bg ||
                                  typeColors.unknown.bg
                                } ${
                                  typeColors[typeInfo.type.name]?.text ||
                                  typeColors.unknown.text
                                } text-xs px-3 py-1 rounded-full capitalize flex items-center shadow-sm`}
                              >
                                {typeIcons[typeInfo.type.name] ||
                                  typeIcons.unknown}{" "}
                                <span className="ml-1">
                                  {typeInfo.type.name}
                                </span>
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {(pokemon.stats || []).map((stat) => (
                              <div key={stat.stat.name}>
                                <div className="text-xs text-gray-400">
                                  {formatStatName(stat.stat.name)}
                                </div>
                                <div className="text-white font-bold">
                                  {stat.base_stat}
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-gradient-to-r from-red-600 to-red-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        (stat.base_stat / 150) * 100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Link
                              to={`/pokemon/${pokemon.id}`}
                              className="py-2 px-4 rounded-xl bg-gray-700 text-white text-center font-medium text-sm hover:bg-gray-600 transition-colors shadow-md"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Team Selector Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Select a Team to Add{" "}
                <span className="capitalize">
                  {selectedPokemon ? selectedPokemon.name : "Pokémon"}
                </span>
              </h3>
              <button
                onClick={() => setShowTeamSelector(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition-colors"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Team Selection */}
            <TeamSelector
              teams={teams}
              onSelect={handleTeamSelect}
              onClose={() => setShowTeamSelector(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import Loading from "./Loading";
import TeamSelector from "./TeamSelector";
import {
  fetchPokemonList,
  fetchPokemonDetail,
  fetchPokemonByType,
  fetchPokemonByGeneration,
  fetchGenerations,
  POKE_API_URL,
} from "../services/api";

import TeamAddSelectorModal from "./TeamAddSelectorModal";

// SVG Background pattern
const BackgroundPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="pokeball-pattern"
        x="0"
        y="0"
        width="60"
        height="60"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="30" cy="30" r="15" fill="white" />
        <circle
          cx="30"
          cy="30"
          r="13"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <line x1="10" y1="30" x2="50" y2="30" stroke="white" strokeWidth="2" />
        <circle cx="30" cy="30" r="5" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pokeball-pattern)" />
  </svg>
);

const PokemonList = ({ addToTeam, toggleFavorite, isFavorite, teams }) => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name"); // name, id, ability
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showTeamAddSelector, setShowTeamAddSelector] = useState(false);

  // Remove showTeamSelector state and usage since we are replacing it with showTeamAddSelector
  const [selectedType, setSelectedType] = useState("");
  const [featuredPokemon, setFeaturedPokemon] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [sortBy, setSortBy] = useState("id"); // id, name, height, weight, base_experience
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const searchInputRef = useRef(null);
  const [pageInput, setPageInput] = useState("");

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
  };

  useEffect(() => {
    fetchGenerationsList();
  }, []);

  useEffect(() => {
    fetchPokemonData();
    fetchFeaturedPokemon();
  }, [
    currentPage,
    selectedType,
    selectedGeneration,
    itemsPerPage,
    sortBy,
    sortOrder,
  ]);

  const fetchGenerationsList = async () => {
    try {
      const data = await fetchGenerations();
      setGenerations(data.results);
    } catch (error) {
      console.error("Error fetching generations:", error);
      setError("Failed to load generations. Please try again.");
    }
  };

  const fetchPokemonData = async () => {
    setLoading(true);
    setError(null);
    try {
      // If a generation is selected, fetch Pokémon by generation
      if (selectedGeneration) {
        const genData = await fetchPokemonByGeneration(selectedGeneration);

        // Extract Pokémon from the generation data
        const genPokemon = genData.pokemon_species;

        // Set total pages based on the number of Pokémon in this generation
        setTotalCount(genPokemon.length);
        setTotalPages(Math.ceil(genPokemon.length / itemsPerPage));

        // Paginate the results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPokemon = genPokemon.slice(startIndex, endIndex);

        // Fetch details for each Pokémon
        const pokemonDetails = await Promise.all(
          paginatedPokemon.map(async (pokemon) => {
            try {
              return await fetchPokemonDetail(pokemon.name);
            } catch (error) {
              console.error(
                `Error fetching details for ${pokemon.name}:`,
                error
              );
              return null;
            }
          })
        );

        // Filter out any null values from failed requests
        const validPokemonDetails = pokemonDetails.filter(Boolean);

        // Sort the Pokémon
        const sortedPokemon = sortPokemon(
          validPokemonDetails,
          sortBy,
          sortOrder
        );
        setPokemon(sortedPokemon);
        setLoading(false);
        return;
      }

      // If a type is selected, fetch Pokémon by type
      if (selectedType) {
        const typeData = await fetchPokemonByType(selectedType);

        // Extract Pokémon from the type data
        const typePokemon = typeData.pokemon.map((p) => p.pokemon);

        // Set total pages based on the number of Pokémon of this type
        setTotalCount(typePokemon.length);
        setTotalPages(Math.ceil(typePokemon.length / itemsPerPage));

        // Paginate the results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPokemon = typePokemon.slice(startIndex, endIndex);

        // Fetch details for each Pokémon
        const pokemonDetails = await Promise.all(
          paginatedPokemon.map(async (pokemon) => {
            try {
              return await fetchPokemonDetail(pokemon.name);
            } catch (error) {
              console.error(
                `Error fetching details for ${pokemon.name}:`,
                error
              );
              return null;
            }
          })
        );

        // Filter out any null values from failed requests
        const validPokemonDetails = pokemonDetails.filter(Boolean);

        // Sort the Pokémon
        const sortedPokemon = sortPokemon(
          validPokemonDetails,
          sortBy,
          sortOrder
        );
        setPokemon(sortedPokemon);
        setLoading(false);
        return;
      }

      // Default fetch all Pokémon - ordered by ID (old gen to new gen)
      const data = await fetchPokemonList(
        itemsPerPage,
        (currentPage - 1) * itemsPerPage
      );

      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / itemsPerPage));

      // Fetch details for each Pokemon
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          try {
            return await fetchPokemonDetail(pokemon.name);
          } catch (error) {
            console.error(`Error fetching details for ${pokemon.name}:`, error);
            return null;
          }
        })
      );

      // Filter out any null values from failed requests
      const validPokemonDetails = pokemonDetails.filter(Boolean);

      // Sort the Pokémon
      const sortedPokemon = sortPokemon(validPokemonDetails, sortBy, sortOrder);
      setPokemon(sortedPokemon);
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      setError("Failed to load Pokémon. Please try again.");
      setPokemon([]);
    } finally {
      setLoading(false);
    }
  };

  const sortPokemon = (pokemonList, sortBy, sortOrder) => {
    return [...pokemonList].sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "height":
          valueA = a.height;
          valueB = b.height;
          break;
        case "weight":
          valueA = a.weight;
          valueB = b.weight;
          break;
        case "base_experience":
          valueA = a.base_experience || 0;
          valueB = b.base_experience || 0;
          break;
        default: // 'id'
          valueA = a.id;
          valueB = b.id;
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  const fetchFeaturedPokemon = async () => {
    try {
      // Get a random starter Pokémon for the featured section
      const starters = [
        1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501,
        650, 653, 656, 722, 725, 728,
      ];
      const randomIndex = Math.floor(Math.random() * starters.length);
      const data = await fetchPokemonDetail(starters[randomIndex]);

      // Get species data for description
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();

      setFeaturedPokemon({
        ...data,
        description:
          speciesData.flavor_text_entries
            ?.find((entry) => entry.language.name === "en")
            ?.flavor_text.replace(/\f/g, " ") ||
          `A fascinating Pokémon with unique abilities. #${data.id} in the Pokédex.`,
      });
    } catch (error) {
      console.error("Error fetching featured Pokémon:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchPokemonData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let searchResults = [];

      switch (searchBy) {
        case "id":
          // Search by ID
          try {
            const pokemon = await fetchPokemonDetail(searchTerm);
            searchResults = [pokemon];
          } catch (error) {
            console.error("Error searching by ID:", error);
            searchResults = [];
          }
          break;

        case "ability":
          // Search by ability
          try {
            const response = await fetch(
              `${POKE_API_URL}/ability/${searchTerm.toLowerCase()}`
            );
            const abilityData = await response.json();

            // Get Pokémon with this ability
            const pokemonWithAbility = await Promise.all(
              abilityData.pokemon.slice(0, 20).map(async (p) => {
                try {
                  return await fetchPokemonDetail(p.pokemon.name);
                } catch (error) {
                  return null;
                }
              })
            );

            searchResults = pokemonWithAbility.filter(Boolean);
          } catch (error) {
            console.error("Error searching by ability:", error);
            searchResults = [];
          }
          break;

        default: // 'name'
          // Search by name
          try {
            const pokemon = await fetchPokemonDetail(searchTerm.toLowerCase());
            searchResults = [pokemon];
          } catch (error) {
            // If exact match fails, try to find Pokémon with similar names
            try {
              const response = await fetch(
                `${POKE_API_URL}/pokemon?limit=1000`
              );
              const data = await response.json();

              const matchingNames = data.results
                .filter((p) => p.name.includes(searchTerm.toLowerCase()))
                .slice(0, 20);

              if (matchingNames.length > 0) {
                const pokemonDetails = await Promise.all(
                  matchingNames.map(async (p) => {
                    try {
                      return await fetchPokemonDetail(p.name);
                    } catch (error) {
                      return null;
                    }
                  })
                );

                searchResults = pokemonDetails.filter(Boolean);
              }
            } catch (searchError) {
              console.error("Error searching by name:", searchError);
              searchResults = [];
            }
          }
      }

      // Sort the search results
      const sortedResults = sortPokemon(searchResults, sortBy, sortOrder);

      setPokemon(sortedResults);
      setTotalCount(sortedResults.length);
      setTotalPages(Math.ceil(sortedResults.length / itemsPerPage));
      setCurrentPage(1);

      if (sortedResults.length === 0) {
        setError(`No Pokémon found for ${searchBy}: "${searchTerm}"`);
      }
    } catch (error) {
      console.error("Error searching Pokemon:", error);
      setError(`Search failed. Please try again.`);
      setPokemon([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTeam = (pokemon) => {
    if (teams.length === 0) {
      alert("You need to create a team first!");
      return;
    }

    setSelectedPokemon(pokemon);
    setShowTeamAddSelector(true);
  };

  const handleTeamSelect = (teamId) => {
    addToTeam(teamId, selectedPokemon);
    setShowTeamAddSelector(false);
    setSelectedPokemon(null);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type === selectedType ? "" : type);
    setSelectedGeneration("");
    setCurrentPage(1);
  };

  const handleGenerationChange = (e) => {
    setSelectedGeneration(e.target.value);
    setSelectedType("");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedType("");
    setSelectedGeneration("");
    setSearchTerm("");
    setCurrentPage(1);
    setSortBy("id");
    setSortOrder("asc");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Get background gradient based on Pokémon's primary type
  const getTypeGradient = (type) => {
    const baseColor =
      typeColors[type]?.bg.replace("bg-[", "").replace("]", "") || "#7AC74C";
    // Create a lighter version of the color for gradient
    return `linear-gradient(135deg, ${baseColor}, ${adjustColor(
      baseColor,
      40
    )})`;
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
    <div className="min-h-screen bg-gray-900  relative">
      {/* Featured Pokémon Section */}
      {featuredPokemon && (
        <div
          className="pt-6 pb-16 px-6 relative overflow-hidden rounded-b-[35px]"
          style={{
            background: getTypeGradient(featuredPokemon.types[0].type.name),
            position: "relative",
          }}
        >
          <BackgroundPattern />

          <div className="container-custom pt-20 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center">
              <div className="md:w-1/2 text-white pl-20 max-md:p-0">
                <h1 className="text-5xl font-bold capitalize mb-6">
                  {featuredPokemon.name}
                </h1>
                <p className="text-xl text-white/80 mb-2">
                  #{featuredPokemon.id.toString().padStart(3, "0")}
                </p>

                <div className="flex gap-2 mb-6">
                  {featuredPokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className="inline-flex items-center"
                    >
                      <span
                        className={`${
                          typeColors[typeInfo.type.name]?.bg || "bg-gray-500"
                        } w-6 h-6 rounded-full flex items-center justify-center mr-1`}
                      >
                        {typeIcons[typeInfo.type.name]}
                      </span>
                      <span className="capitalize">{typeInfo.type.name}</span>
                    </span>
                  ))}
                </div>

                <p className="text-white/90 mb-6">
                  {featuredPokemon.description}
                </p>

                <Link
                  to={`/pokemon/${featuredPokemon.id}`}
                  className="inline-flex items-center bg-black/30 hover:bg-black/50 text-white px-6 py-4 rounded-full transition-colors"
                >
                  <span className="mr-2">More details</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>

              <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
                <img
                  src={
                    featuredPokemon.sprites.other["official-artwork"]
                      .front_default ||
                    featuredPokemon.sprites.front_default ||
                    "/placeholder.svg"
                  }
                  alt={featuredPokemon.name}
                  className="w-64 h-64 object-contain drop-shadow-lg z-10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="container-custom pt-10 relative z-20">
        <div className="bg-secondary-800 max-w-7xl mx-auto rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <h2 className="text-white text-xl font-semibold">Filters:</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-secondary-700 hover:bg-secondary-600 text-white p-2 rounded-full transition-colors"
                aria-label="Toggle filters"
              >
                {showFilters ? <X size={20} /> : <Filter size={20} />}
              </button>

              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="bg-secondary-700 hover:bg-secondary-600 text-white p-2 rounded-full transition-colors"
                aria-label="Toggle advanced search"
              >
                <SlidersHorizontal size={20} />
              </button>

              {(selectedType || selectedGeneration || searchTerm) && (
                <button
                  onClick={resetFilters}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Reset All
                </button>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search by ${searchBy}...`}
                  className="w-full px-4 py-3 pl-10 bg-secondary-700 border border-secondary-600 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={searchInputRef}
                />
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
              </div>
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="px-3 py-3 bg-secondary-700 border-y border-secondary-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="id">ID</option>
                <option value="ability">Ability</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {showAdvancedSearch && (
            <div className="bg-secondary-700 p-4 rounded-lg mb-4">
              <h3 className="text-white font-semibold mb-3">
                Advanced Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Sort By:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="id">ID</option>
                    <option value="name">Name</option>
                    <option value="height">Height</option>
                    <option value="weight">Weight</option>
                    <option value="base_experience">Base Experience</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Sort Order:</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">
                    Items Per Page:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white mb-2">Filter by type:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.keys(typeColors).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(type)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-transform ${
                        selectedType === type
                          ? `${typeColors[type].bg} ${typeColors[type].text} ring-2 ring-white scale-110`
                          : `${typeColors[type].light} hover:scale-105`
                      }`}
                      title={type.charAt(0).toUpperCase() + type.slice(1)}
                    >
                      <span>{typeIcons[type]}</span>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Generation:</label>
                <select
                  value={selectedGeneration}
                  onChange={handleGenerationChange}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Generations</option>
                  {generations.map((gen, index) => (
                    <option key={gen.name} value={gen.name.split("-")[1]}>
                      Generation {index + 1} (
                      {gen.name.split("-")[1].toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pokémon Grid */}
      <div className="container-custom p-20 max-md:p-12 max-sm:p-4">
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-4 rounded-md mb-6 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading />
          </div>
        ) : pokemon.length === 0 ? (
          <div className="bg-secondary-800 rounded-lg shadow-lg p-8 text-center text-white">
            <p className="text-xl">
              No Pokémon found. Try a different search term or filter.
            </p>
            <button
              onClick={() => {
                resetFilters();
                fetchPokemonData();
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw size={18} className="mr-2" />
              Reset and Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-white">
                Showing {pokemon.length} of {totalCount} Pokémon
                {selectedType && ` of type ${selectedType}`}
                {selectedGeneration &&
                  ` from generation ${selectedGeneration.toUpperCase()}`}
              </p>
              <p className="text-white">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-6">
              {pokemon.map((poke) => {
                const primaryType = poke.types[0].type.name;

                return (
                  <div
                    key={poke.id}
                    className="bg-secondary-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105"
                    data-aos="fade-up"
                  >
                    <div
                      className="p-4 flex justify-center items-center relative"
                      style={{ background: getTypeGradient(primaryType) }}
                    >
                      <img
                        src={
                          poke.sprites.other["official-artwork"]
                            .front_default ||
                          poke.sprites.front_default ||
                          "/placeholder.svg"
                        }
                        alt={poke.name}
                        className="h-40 w-40 object-contain drop-shadow-lg z-10"
                      />
                      <div className="ml-4 opacity-30 w-20 h-20 pointer-events-none z-0 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 64 64"
                          className="w-full h-full"
                        >
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            fill="#fff"
                            stroke="#000"
                            strokeWidth="2"
                          />
                          <path d="M2 32h60" stroke="#000" strokeWidth="2" />
                          <circle
                            cx="32"
                            cy="32"
                            r="12"
                            fill="#fff"
                            stroke="#000"
                            strokeWidth="2"
                          />
                          <circle cx="32" cy="32" r="6" fill="#000" />
                        </svg>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(poke);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-20"
                        aria-label={
                          isFavorite(poke.id)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={isFavorite(poke.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={
                            isFavorite(poke.id) ? "text-pink-600" : "text-white"
                          }
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-white capitalize">
                          {poke.name}
                        </h3>
                        <span className="text-gray-400 font-semibold">
                          #{poke.id.toString().padStart(3, "0")}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-4">
                        {poke.types.map((typeInfo) => (
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
                            {typeIcons[typeInfo.type.name]}{" "}
                            <span className="ml-1">{typeInfo.type.name}</span>
                          </span>
                        ))}
                      </div>

                      {/* Base Stats */}
                      <div className="mb-4">
                        <h4 className="text-white text-sm font-semibold mb-2">
                          Base Stats:
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {poke.stats.slice(0, 6).map((stat) => (
                            <div key={stat.stat.name} className="text-center">
                              <div className="text-xs text-gray-400 capitalize">
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

                      <div className="flex justify-between text-gray-300 text-sm mb-4">
                        <div className="flex flex-col items-center">
                          <span>{(poke.height / 10).toFixed(1)} M</span>
                          <span className="text-gray-500 text-xs">Height</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span>{(poke.weight / 10).toFixed(1)} KG</span>
                          <span className="text-gray-500 text-xs">Weight</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span>{poke.base_experience || "?"}</span>
                          <span className="text-gray-500 text-xs">
                            Base Exp
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/pokemon/${poke.id}`}
                          className="flex-1 bg-secondary-700 hover:bg-secondary-600 text-white text-center py-2 rounded-md transition-colors flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                          </svg>
                          Details
                        </Link>
                        <button
                          onClick={() => handleAddToTeam(poke)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 rounded-md transition-colors"
                        >
                          Add to Team
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Pagination */}
            {!searchTerm && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                <div className="flex items-center bg-secondary-800 rounded-lg">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                    aria-label="First page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="11 17 6 12 11 7"></polyline>
                      <polyline points="18 17 13 12 18 7"></polyline>
                    </svg>
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex">
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNum;

                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-10 mx-1 flex items-center justify-center rounded-full transition-colors duration-300 ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white shadow-lg px-4"
                                : "text-gray-400 hover:bg-blue-500 hover:text-white px-3"
                            } ${pageNum >= 100 ? "tracking-widest" : "w-10"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                    aria-label="Last page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="13 17 18 12 13 7"></polyline>
                      <polyline points="6 17 11 12 6 7"></polyline>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white">Go to page:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={
                      pageInput === "" ? currentPage.toString() : pageInput
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setPageInput(value);
                      }
                    }}
                    onBlur={() => {
                      let page = Number(pageInput);
                      if (isNaN(page) || page < 1) {
                        page = 1;
                      } else if (page > totalPages) {
                        page = totalPages;
                      }
                      setPageInput(page.toString());
                      setCurrentPage(page);
                    }}
                    className="min-w-[3rem] text-center px-2 py-1 bg-secondary-700 border border-secondary-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-white">of {totalPages}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showTeamSelector && (
        <TeamSelector
          teams={teams}
          onSelect={handleTeamSelect}
          onClose={() => setShowTeamSelector(false)}
        />
      )}
      {showTeamAddSelector && (
        <TeamAddSelectorModal
          teams={teams}
          onSelect={handleTeamSelect}
          onCreate={(teamName) => {
            // Create new team logic here
            // For now, just close modal and alert
            alert(`Create new team: ${teamName}`);
            setShowTeamAddSelector(false);
            setSelectedPokemon(null);
          }}
          onClose={() => {
            setShowTeamAddSelector(false);
            setSelectedPokemon(null);
          }}
        />
      )}
    </div>
  );
};

export default PokemonList;

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Info,
  MapPin,
  AlertTriangle,
  Zap,
  Shield,
  Wind,
  BarChart2,
  Dna,
  Award,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import TeamSelector from "./TeamSelector";

const PokemonDetailV2 = ({ addToTeam, toggleFavorite, isFavorite, teams }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [evolutionPokemon, setEvolutionPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [typeWeaknesses, setTypeWeaknesses] = useState([]);
  const [error, setError] = useState(null);
  const [abilities, setAbilities] = useState([]);
  const [similarPokemon, setSimilarPokemon] = useState([]);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      setLoading(true);
      try {
        // Fetch basic Pokémon data
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) {
          throw new Error("Pokemon not found");
        }
        const data = await response.json();
        setPokemon(data);

        // Fetch species data for more details
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        setSpecies(speciesData);

        // Fetch ability details
        const abilityDetails = await Promise.all(
          data.abilities.map(async (ability) => {
            try {
              const abilityResponse = await fetch(ability.ability.url);
              const abilityData = await abilityResponse.json();

              // Get English description
              const description =
                abilityData.flavor_text_entries
                  .find((entry) => entry.language.name === "en")
                  ?.flavor_text.replace(/\f/g, " ") ||
                "No description available.";

              return {
                ...ability,
                name: abilityData.name,
                description: description,
                effect:
                  abilityData.effect_entries.find(
                    (entry) => entry.language.name === "en"
                  )?.effect || "",
              };
            } catch (error) {
              console.error(
                `Error fetching ability ${ability.ability.name}:`,
                error
              );
              return ability;
            }
          })
        );
        setAbilities(abilityDetails);

        // Fetch evolution chain
        if (speciesData.evolution_chain) {
          const evolutionResponse = await fetch(
            speciesData.evolution_chain.url
          );
          const evolutionData = await evolutionResponse.json();
          setEvolutionChain(evolutionData);

          // Process evolution chain to get all Pokémon in the chain
          const evoChain = [];
          let currentEvo = evolutionData.chain;

          do {
            const speciesName = currentEvo.species.name;
            const speciesUrl = currentEvo.species.url;
            const id = speciesUrl.split("/").filter(Boolean).pop();

            evoChain.push({
              name: speciesName,
              id: id,
              min_level: currentEvo.evolution_details[0]?.min_level || null,
              trigger: currentEvo.evolution_details[0]?.trigger?.name || null,
              item: currentEvo.evolution_details[0]?.item?.name || null,
            });

            currentEvo = currentEvo.evolves_to[0];
          } while (currentEvo && currentEvo.hasOwnProperty("evolves_to"));

          // Fetch details for each Pokémon in the evolution chain
          const evolutionDetails = await Promise.all(
            evoChain.map(async (evo) => {
              try {
                const res = await fetch(
                  `https://pokeapi.co/api/v2/pokemon/${evo.id}`
                );
                const data = await res.json();
                return {
                  ...evo,
                  sprites: data.sprites,
                  types: data.types,
                };
              } catch (error) {
                console.error(
                  `Error fetching evolution Pokémon ${evo.name}:`,
                  error
                );
                return evo;
              }
            })
          );

          setEvolutionPokemon(evolutionDetails);
        }

        // Calculate type weaknesses
        const weaknesses = await calculateTypeWeaknesses(
          data.types.map((t) => t.type.name)
        );
        setTypeWeaknesses(weaknesses);

        // Fetch similar Pokémon (same type)
        if (data.types && data.types.length > 0) {
          const primaryType = data.types[0].type.name;
          const typeResponse = await fetch(
            `https://pokeapi.co/api/v2/type/${primaryType}`
          );
          const typeData = await typeResponse.json();

          // Get 4 random Pokémon of the same type (excluding current one)
          const typePokemon = typeData.pokemon
            .filter((p) => {
              const pokeId = p.pokemon.url.split("/").filter(Boolean).pop();
              return pokeId !== id;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

          // Fetch details for similar Pokémon
          const similarPokemonDetails = await Promise.all(
            typePokemon.map(async (p) => {
              try {
                const res = await fetch(p.pokemon.url);
                return await res.json();
              } catch (error) {
                console.error(`Error fetching similar Pokémon:`, error);
                return null;
              }
            })
          );

          setSimilarPokemon(similarPokemonDetails.filter(Boolean));
        }
      } catch (error) {
        console.error("Error fetching Pokemon details:", error);
        setError("Failed to load Pokémon details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  // Calculate type weaknesses based on Pokémon types
  const calculateTypeWeaknesses = async (types) => {
    try {
      // Fetch type data for each of the Pokémon's types
      const typeData = await Promise.all(
        types.map(async (type) => {
          const response = await fetch(
            `https://pokeapi.co/api/v2/type/${type}`
          );
          return await response.json();
        })
      );

      // Type effectiveness mapping
      const effectiveness = {
        normal: 1,
        fire: 1,
        water: 1,
        electric: 1,
        grass: 1,
        ice: 1,
        fighting: 1,
        poison: 1,
        ground: 1,
        flying: 1,
        psychic: 1,
        bug: 1,
        rock: 1,
        ghost: 1,
        dragon: 1,
        dark: 1,
        steel: 1,
        fairy: 1,
      };

      // Calculate effectiveness for each type
      typeData.forEach((data) => {
        // Double damage from (weakness)
        data.damage_relations.double_damage_from.forEach((type) => {
          effectiveness[type.name] *= 2;
        });

        // Half damage from (resistance)
        data.damage_relations.half_damage_from.forEach((type) => {
          effectiveness[type.name] *= 0.5;
        });

        // No damage from (immunity)
        data.damage_relations.no_damage_from.forEach((type) => {
          effectiveness[type.name] = 0;
        });
      });

      // Filter out types that are weaknesses (effectiveness > 1)
      const weaknesses = Object.entries(effectiveness)
        .filter(([_, value]) => value > 1)
        .map(([type, value]) => ({ type, multiplier: value }))
        .sort((a, b) => b.multiplier - a.multiplier);

      return weaknesses;
    } catch (error) {
      console.error("Error calculating type weaknesses:", error);
      return [];
    }
  };

  // Type definitions with colors
  const typeColors = {
    normal: {
      bg: "bg-gray-400",
      text: "text-white",
      light: "bg-gray-300",
      gradient: "from-gray-400 to-gray-500",
    },
    fire: {
      bg: "bg-orange-500",
      text: "text-white",
      light: "bg-orange-400",
      gradient: "from-orange-500 to-red-600",
    },
    water: {
      bg: "bg-blue-500",
      text: "text-white",
      light: "bg-blue-400",
      gradient: "from-blue-500 to-blue-600",
    },
    electric: {
      bg: "bg-yellow-400",
      text: "text-gray-800",
      light: "bg-yellow-300",
      gradient: "from-yellow-400 to-yellow-500",
    },
    grass: {
      bg: "bg-green-500",
      text: "text-white",
      light: "bg-green-400",
      gradient: "from-green-500 to-green-600",
    },
    ice: {
      bg: "bg-blue-300",
      text: "text-gray-800",
      light: "bg-blue-200",
      gradient: "from-blue-300 to-blue-400",
    },
    fighting: {
      bg: "bg-red-700",
      text: "text-white",
      light: "bg-red-600",
      gradient: "from-red-700 to-red-800",
    },
    poison: {
      bg: "bg-purple-500",
      text: "text-white",
      light: "bg-purple-400",
      gradient: "from-purple-500 to-purple-600",
    },
    ground: {
      bg: "bg-yellow-600",
      text: "text-white",
      light: "bg-yellow-500",
      gradient: "from-yellow-600 to-yellow-700",
    },
    flying: {
      bg: "bg-indigo-300",
      text: "text-gray-800",
      light: "bg-indigo-200",
      gradient: "from-indigo-300 to-indigo-400",
    },
    psychic: {
      bg: "bg-pink-500",
      text: "text-white",
      light: "bg-pink-400",
      gradient: "from-pink-500 to-pink-600",
    },
    bug: {
      bg: "bg-lime-500",
      text: "text-white",
      light: "bg-lime-400",
      gradient: "from-lime-500 to-lime-600",
    },
    rock: {
      bg: "bg-yellow-800",
      text: "text-white",
      light: "bg-yellow-700",
      gradient: "from-yellow-800 to-yellow-900",
    },
    ghost: {
      bg: "bg-purple-700",
      text: "text-white",
      light: "bg-purple-600",
      gradient: "from-purple-700 to-purple-800",
    },
    dragon: {
      bg: "bg-indigo-600",
      text: "text-white",
      light: "bg-indigo-500",
      gradient: "from-indigo-600 to-indigo-700",
    },
    dark: {
      bg: "bg-gray-800",
      text: "text-white",
      light: "bg-gray-700",
      gradient: "from-gray-800 to-gray-900",
    },
    steel: {
      bg: "bg-gray-500",
      text: "text-white",
      light: "bg-gray-400",
      gradient: "from-gray-500 to-gray-600",
    },
    fairy: {
      bg: "bg-pink-300",
      text: "text-gray-800",
      light: "bg-pink-200",
      gradient: "from-pink-300 to-pink-400",
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

  const handleAddToTeam = () => {
    if (!pokemon) return;

    if (teams.length === 0) {
      alert("You need to create a team first!");
      return;
    }

    setShowTeamSelector(true);
  };

  const handleTeamSelect = (teamId) => {
    addToTeam(teamId, pokemon);
    setShowTeamSelector(false);
  };

  const handleGoBack = () => {
    navigate("/"); // Navigate directly to the root path where the Pokémon list is
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-4">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
          <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
          <button
            onClick={handleGoBack}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-4">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pokémon not found
          </h2>
          <button
            onClick={handleGoBack}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const typeColorClass = typeColors[primaryType]?.bg || "bg-gray-500";
  const typeGradient =
    typeColors[primaryType]?.gradient || "from-gray-500 to-gray-600";

  // Get English flavor text
  const englishFlavorText = species?.flavor_text_entries
    .find((entry) => entry.language.name === "en")
    ?.flavor_text.replace(/\f/g, " ");

  // Get habitat
  const habitat = species?.habitat?.name || "Unknown";

  // Get generation
  const generation =
    species?.generation?.name.replace("generation-", "").toUpperCase() ||
    "Unknown";

  // Get growth rate
  const growthRate = species?.growth_rate?.name.replace("-", " ") || "Unknown";

  const getTypeGradient = (typeName) => {
    return typeColors[typeName]?.gradient || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={handleGoBack}
          className="flex items-center text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Pokédex
        </button>
      </div>

      {/* Hero Section */}
      <div
        className={`bg-gradient-to-br ${typeGradient} pt-8 pb-32 px-6 relative overflow-hidden`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-white">
              <div className="flex items-center mb-2">
                <h1 className="text-5xl font-bold capitalize mr-3">
                  {pokemon.name}
                </h1>
                <span className="bg-black/30 text-white px-3 py-1 rounded-full text-lg">
                  #{pokemon.id.toString().padStart(3, "0")}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                {pokemon.types.map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className={`${
                      typeColors[typeInfo.type.name]?.bg || "bg-gray-500"
                    } ${
                      typeColors[typeInfo.type.name]?.text || "text-white"
                    } px-3 py-1 rounded-full capitalize flex items-center`}
                  >
                    {typeIcons[typeInfo.type.name]}{" "}
                    <span className="ml-1">{typeInfo.type.name}</span>
                  </span>
                ))}
              </div>

              <p className="text-white/90 mb-6 max-w-md">
                {englishFlavorText ||
                  "A fascinating Pokémon with unique abilities."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToTeam}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-colors flex items-center"
                >
                  <Shield className="mr-2" size={18} />
                  Add to Team
                </button>
                <button
                  onClick={() => toggleFavorite(pokemon)}
                  className={`${
                    isFavorite(pokemon.id)
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "bg-white/20 hover:bg-white/30"
                  } text-white px-4 py-2 rounded-full transition-colors flex items-center`}
                >
                  <Heart
                    className="mr-2"
                    size={18}
                    fill={isFavorite(pokemon.id) ? "white" : "none"}
                  />
                  {isFavorite(pokemon.id) ? "Favorited" : "Add to Favorites"}
                </button>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
              <img
                src={
                  pokemon.sprites.other["official-artwork"].front_default ||
                  pokemon.sprites.front_default ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                }
                alt={pokemon.name}
                className="w-64 h-64 object-contain drop-shadow-lg z-10"
              />
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-4 border-white"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full border-4 border-white"></div>
          <div className="absolute top-40 right-40 w-16 h-16 rounded-full border-4 border-white"></div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto pb-20 -mt-20 relative z-10 max-w-6xl">
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === "stats"
                  ? `${typeColorClass} text-white`
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <BarChart2 size={18} className="inline mr-2" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === "about"
                  ? `${typeColorClass} text-white`
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Info size={18} className="inline mr-2" />
              About
            </button>
            <button
              onClick={() => setActiveTab("evolution")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === "evolution"
                  ? `${typeColorClass} text-white`
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Dna size={18} className="inline mr-2" />
              Evolution
            </button>
            <button
              onClick={() => setActiveTab("abilities")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === "abilities"
                  ? `${typeColorClass} text-white`
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Zap size={18} className="inline mr-2" />
              Abilities
            </button>
            <button
              onClick={() => setActiveTab("moves")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === "moves"
                  ? `${typeColorClass} text-white`
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Wind size={18} className="inline mr-2" />
              Moves
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "stats" && (
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <BarChart2 size={24} className={`mr-2 ${typeColorClass}`} />
                  Base Stats
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {pokemon.stats.map((stat) => {
                      const statName = stat.stat.name.replace("-", " ");
                      const statValue = stat.base_stat;
                      const maxStat = 255; // Max possible base stat
                      const percentage = (statValue / maxStat) * 100;

                      return (
                        <div key={stat.stat.name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium capitalize">
                              {statName}
                            </span>
                            <span className="text-sm font-medium">
                              {statValue}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${typeColorClass}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-gray-300">Total</h4>
                      <p className="text-2xl font-bold">
                        {pokemon.stats.reduce(
                          (total, stat) => total + stat.base_stat,
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="bg-gray-700 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <AlertTriangle
                          size={20}
                          className="mr-2 text-red-500"
                        />
                        Type Weaknesses
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {typeWeaknesses.map((weakness) => (
                          <div
                            key={weakness.type}
                            className="flex flex-col items-center"
                          >
                            <span
                              className={`${
                                typeColors[weakness.type]?.bg || "bg-gray-500"
                              } ${
                                typeColors[weakness.type]?.text || "text-white"
                              } w-10 h-10 rounded-full flex items-center justify-center`}
                            >
                              {typeIcons[weakness.type]}
                            </span>
                            <span className="text-xs font-bold mt-1 text-red-400">
                              {weakness.multiplier}x
                            </span>
                          </div>
                        ))}
                        {typeWeaknesses.length === 0 && (
                          <p className="text-gray-500 italic">
                            No specific weaknesses
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">
                        Physical Traits
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-600 p-3 rounded-lg">
                          <p className="text-sm text-gray-400">Height</p>
                          <p className="text-xl font-medium">
                            {pokemon.height / 10} m
                          </p>
                        </div>
                        <div className="bg-gray-600 p-3 rounded-lg">
                          <p className="text-sm text-gray-400">Weight</p>
                          <p className="text-xl font-medium">
                            {pokemon.weight / 10} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Info size={24} className={`mr-2 ${typeColorClass}`} />
                  Pokémon Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={18} className="text-red-500" />
                        <h4 className="font-medium">Habitat</h4>
                      </div>
                      <p className="capitalize text-gray-300">{habitat}</p>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-yellow-500" />
                        <h4 className="font-medium">Generation</h4>
                      </div>
                      <p className="text-gray-300">{generation}</p>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart2 size={18} className="text-blue-500" />
                        <h4 className="font-medium">Growth Rate</h4>
                      </div>
                      <p className="capitalize text-gray-300">{growthRate}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Base Experience</h4>
                      <p className="text-2xl font-bold">
                        {pokemon.base_experience || "Unknown"}
                      </p>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Capture Rate</h4>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">
                          {species?.capture_rate || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-400">/ 255</p>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                        <div
                          className={`h-2.5 rounded-full ${typeColorClass}`}
                          style={{
                            width: `${
                              (species?.capture_rate / 255) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Base Happiness</h4>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">
                          {species?.base_happiness || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-400">/ 255</p>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                        <div
                          className={`h-2.5 rounded-full ${typeColorClass}`}
                          style={{
                            width: `${
                              (species?.base_happiness / 255) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "evolution" && (
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Dna size={24} className={`mr-2 ${typeColorClass}`} />
                  Evolution Chain
                </h3>

                {evolutionPokemon.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                      {evolutionPokemon.map((evo, index) => (
                        <div
                          key={evo.id}
                          className="flex flex-col items-center"
                        >
                          {index > 0 && (
                            <div className="flex flex-col items-center mb-4 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 5v14"></path>
                                <path d="m19 12-7 7-7-7"></path>
                              </svg>
                              <span className="text-xs mt-1">
                                {evo.min_level
                                  ? `Level ${evo.min_level}`
                                  : evo.trigger === "use-item"
                                  ? `Use ${evo.item?.replace("-", " ")}`
                                  : "Evolution"}
                              </span>
                            </div>
                          )}

                          <Link to={`/pokemon/${evo.id}`} className="group">
                            <div
                              className={`bg-gray-700 p-4 rounded-lg transition-transform group-hover:scale-105 ${
                                evo.id === pokemon.id
                                  ? `ring-2 ring-${primaryType}`
                                  : ""
                              }`}
                            >
                              <div className="flex justify-center">
                                <img
                                  src={
                                    evo.sprites?.other?.["official-artwork"]
                                      ?.front_default ||
                                    evo.sprites?.front_default ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt={evo.name}
                                  className="w-32 h-32 object-contain"
                                />
                              </div>

                              <div className="text-center mt-2">
                                <h4 className="font-bold capitalize">
                                  {evo.name}
                                </h4>
                                <p className="text-gray-400">
                                  #{evo.id.toString().padStart(3, "0")}
                                </p>

                                {evo.types && (
                                  <div className="flex justify-center gap-2 mt-2">
                                    {evo.types.map((typeInfo) => (
                                      <span
                                        key={typeInfo.type.name}
                                        className={`${
                                          typeColors[typeInfo.type.name]?.bg ||
                                          "bg-gray-500"
                                        } ${
                                          typeColors[typeInfo.type.name]
                                            ?.text || "text-white"
                                        } text-xs px-2 py-0.5 rounded-full capitalize`}
                                      >
                                        {typeInfo.type.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-center">
                    No evolution data available
                  </p>
                )}
              </div>
            )}

            {activeTab === "abilities" && (
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Zap size={24} className={`mr-2 ${typeColorClass}`} />
                  Abilities
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {abilities.map((ability) => (
                    <div
                      key={ability.ability.name}
                      className="bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium capitalize text-lg">
                          {ability.name?.replace("-", " ") ||
                            ability.ability.name.replace("-", " ")}
                        </h4>
                        {ability.is_hidden && (
                          <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded-full">
                            Hidden Ability
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-2">
                        {ability.description || "No description available."}
                      </p>
                      {ability.effect && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-sm text-gray-400">Effect:</p>
                          <p className="text-sm text-gray-300">
                            {ability.effect}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "moves" && (
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Wind size={24} className={`mr-2 ${typeColorClass}`} />
                  Moves
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pokemon.moves.slice(0, 32).map((move) => (
                    <div
                      key={move.move.name}
                      className="bg-gray-700 p-3 rounded-lg"
                    >
                      <p className="capitalize">
                        {move.move.name.replace("-", " ")}
                      </p>
                    </div>
                  ))}
                </div>

                {pokemon.moves.length > 32 && (
                  <p className="text-gray-400 mt-4 text-center">
                    Showing 32 of {pokemon.moves.length} moves
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Pokémon Section */}
        {similarPokemon.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Similar Pokémon
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarPokemon.map((poke) => (
                <Link
                  to={`/pokemon/${poke.id}`}
                  key={poke.id}
                  className="block"
                >
                  <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                    <div
                      className={`bg-gradient-to-br ${getTypeGradient(
                        poke.types[0].type.name
                      )} p-2 flex justify-center`}
                    >
                      <img
                        src={
                          poke.sprites.other["official-artwork"]
                            .front_default || poke.sprites.front_default
                        }
                        alt={poke.name}
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-white font-medium capitalize">
                        {poke.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        #{poke.id.toString().padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* External Resources */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            External Resources
          </h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://bulbapedia.bulbagarden.net/wiki/${
                pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
              }_(Pokémon)`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Bulbapedia
            </a>
            <a
              href={`https://www.serebii.net/pokedex-sv/${pokemon.id
                .toString()
                .padStart(3, "0")}.shtml`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Serebii
            </a>
            <a
              href={`https://www.smogon.com/dex/sv/pokemon/${pokemon.name}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Smogon
            </a>
          </div>
        </div>
      </div>

      {showTeamSelector && (
        <TeamSelector
          teams={teams}
          onSelect={handleTeamSelect}
          onClose={() => setShowTeamSelector(false)}
        />
      )}
    </div>
  );
};

export default PokemonDetailV2;

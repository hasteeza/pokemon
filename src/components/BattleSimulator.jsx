import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveBattle } from "../services/api";

const BattleSimulator = ({ team }) => {
  const navigate = useNavigate();

  const [selectedPokemon1, setSelectedPokemon1] = useState(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [battleLog, setBattleLog] = useState([]);

  // Reset battle when team changes
  useEffect(() => {
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    setBattleResult(null);
    setBattleLog([]);
  }, [team]);

  const selectPokemon = (pokemon, slot) => {
    if (slot === 1) {
      setSelectedPokemon1(pokemon);
      if (selectedPokemon2 && selectedPokemon2.id === pokemon.id) {
        setSelectedPokemon2(null);
      }
    } else {
      setSelectedPokemon2(pokemon);
      if (selectedPokemon1 && selectedPokemon1.id === pokemon.id) {
        setSelectedPokemon1(null);
      }
    }
    setBattleResult(null);
    setBattleLog([]);
  };

  const startBattle = () => {
    if (!selectedPokemon1 || !selectedPokemon2) {
      alert("Please select two Pokémon to battle!");
      return;
    }
    setBattleInProgress(true);
    setBattleLog([
      `Battle started between ${selectedPokemon1.name.toUpperCase()} and ${selectedPokemon2.name.toUpperCase()}!`,
    ]);
    setTimeout(() => {
      const result = simulateBattle(selectedPokemon1, selectedPokemon2);
      setBattleResult(result);
      saveBattle(result).catch((error) =>
        console.error("Error saving battle result:", error)
      );
      setBattleInProgress(false);
    }, 2000);
  };

  const cancelMatch = () => {
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    setBattleResult(null);
    setBattleLog([]);
    setBattleInProgress(false);
    navigate("/teams");
  };

  const simulateBattle = (pokemon1, pokemon2) => {
    const p1Stats = {
      hp: pokemon1.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: pokemon1.stats.find((s) => s.stat.name === "attack").base_stat,
      speed: pokemon1.stats.find((s) => s.stat.name === "speed").base_stat,
    };
    const p2Stats = {
      hp: pokemon2.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: pokemon2.stats.find((s) => s.stat.name === "attack").base_stat,
      speed: pokemon2.stats.find((s) => s.stat.name === "speed").base_stat,
    };
    const rounds = [
      {
        stat: "hp",
        winner:
          p1Stats.hp > p2Stats.hp
            ? pokemon1.id
            : p1Stats.hp < p2Stats.hp
            ? pokemon2.id
            : "tie",
      },
      {
        stat: "attack",
        winner:
          p1Stats.attack > p2Stats.attack
            ? pokemon1.id
            : p1Stats.attack < p2Stats.attack
            ? pokemon2.id
            : "tie",
      },
      {
        stat: "speed",
        winner:
          p1Stats.speed > p2Stats.speed
            ? pokemon1.id
            : p1Stats.speed < p2Stats.speed
            ? pokemon2.id
            : "tie",
      },
    ];
    setBattleLog((prev) => [
      ...prev,
      `Round 1 (HP): ${pokemon1.name.toUpperCase()} (${
        p1Stats.hp
      }) vs ${pokemon2.name.toUpperCase()} (${p2Stats.hp}) - ${
        rounds[0].winner === "tie"
          ? "TIE!"
          : rounds[0].winner === pokemon1.id
          ? `${pokemon1.name.toUpperCase()} wins!`
          : `${pokemon2.name.toUpperCase()} wins!`
      }`,
      `Round 2 (Attack): ${pokemon1.name.toUpperCase()} (${
        p1Stats.attack
      }) vs ${pokemon2.name.toUpperCase()} (${p2Stats.attack}) - ${
        rounds[1].winner === "tie"
          ? "TIE!"
          : rounds[1].winner === pokemon1.id
          ? `${pokemon1.name.toUpperCase()} wins!`
          : `${pokemon2.name.toUpperCase()} wins!`
      }`,
      `Round 3 (Speed): ${pokemon1.name.toUpperCase()} (${
        p1Stats.speed
      }) vs ${pokemon2.name.toUpperCase()} (${p2Stats.speed}) - ${
        rounds[2].winner === "tie"
          ? "TIE!"
          : rounds[2].winner === pokemon1.id
          ? `${pokemon1.name.toUpperCase()} wins!`
          : `${pokemon2.name.toUpperCase()} wins!`
      }`,
    ]);
    let p1Wins = 0;
    let p2Wins = 0;
    rounds.forEach((round) => {
      if (round.winner === pokemon1.id) p1Wins++;
      else if (round.winner === pokemon2.id) p2Wins++;
    });
    let winner;
    if (p1Wins > p2Wins) {
      winner = pokemon1;
    } else if (p2Wins > p1Wins) {
      winner = pokemon2;
    } else {
      const p1Total = p1Stats.hp + p1Stats.attack + p1Stats.speed;
      const p2Total = p2Stats.hp + p2Stats.attack + p2Stats.speed;
      winner = p1Total > p2Total ? pokemon1 : pokemon2;
    }
    setBattleLog((prev) => [
      ...prev,
      `${winner.name.toUpperCase()} is the winner!`,
    ]);
    return {
      pokemon1: {
        id: pokemon1.id,
        name: pokemon1.name,
        sprite: pokemon1.sprites.front_default,
        stats: p1Stats,
      },
      pokemon2: {
        id: pokemon2.id,
        name: pokemon2.name,
        sprite: pokemon2.sprites.front_default,
        stats: p2Stats,
      },
      rounds,
      winner: {
        id: winner.id,
        name: winner.name,
      },
      date: new Date().toISOString(),
    };
  };

  const getTypeColor = (type) => {
    const typeColors = {
      normal: "bg-gray-400",
      fire: "bg-orange-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-300",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-300",
      psychic: "bg-pink-500",
      bug: "bg-lime-500",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-600",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    };
    return typeColors[type] || "bg-gray-400";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Battle Simulator</h1>

      {team.length < 2 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl mb-4">
            You need at least 2 Pokémon to battle!
          </h2>
          <p className="text-gray-600 mb-6">
            Add more Pokémon to your team to use the Battle Simulator.
          </p>
          <Link
            to="/"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Go to Pokédex
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pokemon Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Select Pokémon</h2>
            <div className="space-y-4">
              {team.map((pokemon) => {
                const primaryType = pokemon.types[0].type.name;
                const typeColorClass = getTypeColor(primaryType);
                const isSelected =
                  selectedPokemon1?.id === pokemon.id ||
                  selectedPokemon2?.id === pokemon.id;

                return (
                  <div
                    key={pokemon.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? `${typeColorClass} text-white`
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <img
                      src={pokemon.sprites.front_default || "/placeholder.svg"}
                      alt={pokemon.name}
                      className="w-12 h-12 mr-3"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium capitalize">{pokemon.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {pokemon.types.map((typeInfo) => (
                          <span
                            key={typeInfo.type.name}
                            className={`${
                              isSelected
                                ? "bg-white text-gray-800"
                                : getTypeColor(typeInfo.type.name) +
                                  " text-white"
                            } text-xs px-2 py-0.5 rounded-full capitalize`}
                          >
                            {typeInfo.type.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => selectPokemon(pokemon, 1)}
                        className={`px-2 py-1 rounded ${
                          selectedPokemon1?.id === pokemon.id
                            ? "bg-white text-red-600 font-medium"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {selectedPokemon1?.id === pokemon.id ? "Selected" : "1"}
                      </button>
                      <button
                        onClick={() => selectPokemon(pokemon, 2)}
                        className={`px-2 py-1 rounded ${
                          selectedPokemon2?.id === pokemon.id
                            ? "bg-white text-blue-600 font-medium"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {selectedPokemon2?.id === pokemon.id ? "Selected" : "2"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Battle Arena */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-xl font-semibold mb-4">Battle Arena</h2>

              {!selectedPokemon1 || !selectedPokemon2 ? (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Select two Pokémon to battle</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Pokemon 1 */}
                    <div className="bg-red-100 rounded-lg p-4 text-center">
                      <div className="flex justify-center">
                        <img
                          src={
                            selectedPokemon1.sprites.other["official-artwork"]
                              .front_default ||
                            selectedPokemon1.sprites.front_default
                          }
                          alt={selectedPokemon1.name}
                          className="h-32 w-32 object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-semibold capitalize mt-2">
                        {selectedPokemon1.name}
                      </h3>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {selectedPokemon1.stats.slice(0, 3).map((stat) => (
                          <div key={stat.stat.name} className="text-center">
                            <p className="text-xs text-gray-600 capitalize">
                              {stat.stat.name.replace("-", " ")}
                            </p>
                            <p className="font-medium">{stat.base_stat}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pokemon 2 */}
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <div className="flex justify-center">
                        <img
                          src={
                            selectedPokemon2.sprites.other["official-artwork"]
                              .front_default ||
                            selectedPokemon2.sprites.front_default
                          }
                          alt={selectedPokemon2.name}
                          className="h-32 w-32 object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-semibold capitalize mt-2">
                        {selectedPokemon2.name}
                      </h3>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {selectedPokemon2.stats.slice(0, 3).map((stat) => (
                          <div key={stat.stat.name} className="text-center">
                            <p className="text-xs text-gray-600 capitalize">
                              {stat.stat.name.replace("-", " ")}
                            </p>
                            <p className="font-medium">{stat.base_stat}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Battle Controls */}
                  <div className="flex justify-center mb-6 gap-4">
                    <button
                      onClick={startBattle}
                      disabled={battleInProgress}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                    >
                      {battleInProgress
                        ? "Battle in progress..."
                        : battleResult
                        ? "Battle Again"
                        : "Start Battle"}
                    </button>
                    <button
                      onClick={cancelMatch}
                      disabled={battleInProgress}
                      className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                    >
                      Cancel Match
                    </button>
                  </div>

                  {/* Battle Log */}
                  {battleLog.length > 0 && (
                    <div className="bg-gray-100 rounded-lg p-4 mt-4">
                      <h3 className="font-semibold mb-2">Battle Log</h3>
                      <div className="space-y-2">
                        {battleLog.map((log, index) => (
                          <p
                            key={index}
                            className={`${
                              log.includes("winner")
                                ? "text-lg font-bold text-red-600"
                                : ""
                            }`}
                          >
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Battle Result */}
                  {battleResult && (
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-bold mb-2">
                        {battleResult.winner.name.toUpperCase()} wins the
                        battle!
                      </h3>
                      <Link
                        to="/history"
                        className="text-blue-600 hover:underline"
                      >
                        View Battle History
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleSimulator;

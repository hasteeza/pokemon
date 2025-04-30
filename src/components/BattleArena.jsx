import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { saveBattle } from "../services/api"

const BattleArena = ({ teams }) => {
  const { teamId } = useParams()
  const navigate = useNavigate()

  // Use refs to track state between renders
  const battleSaved = useRef(false)
  const isInitialized = useRef(false)
  const modalResponsePending = useRef(false)
  const gameStateRef = useRef({
    playerWins: 0,
    aiWins: 0,
    battleHistory: [],
  })

  // Regular state
  const [playerTeam, setPlayerTeam] = useState(null)
  const [aiTeam, setAiTeam] = useState(null)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [aiPokemon, setAiPokemon] = useState(null)
  const [battleInProgress, setBattleInProgress] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [battleLog, setBattleLog] = useState([])
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [battleHistory, setBattleHistory] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isGameOverHandled, setIsGameOverHandled] = useState(false)
  const [savingBattle, setSavingBattle] = useState(false)

  // Initialize teams only once when component mounts
  useEffect(() => {
    // If we already have a modal showing, don't reinitialize
    if (showModal || modalResponsePending.current) {
      console.log("Modal is showing, skipping initialization")
      return
    }

    // If we already have teams loaded, don't reload
    if (isInitialized.current) {
      console.log("Teams already loaded, skipping initialization")
      return
    }

    const loadTeam = () => {
      console.log("Loading team with ID:", teamId)
      const team = teams.find((t) => t.id === Number.parseInt(teamId) || t.id === teamId)
      if (!team || !team.pokemon || team.pokemon.length < 2) {
        // Replace alert with navigation
        console.error("Invalid team or not enough Pokémon in the team")
        navigate("/teams")
        return
      }
      setPlayerTeam({
        ...team,
        pokemon: [...team.pokemon],
        remainingPokemon: [...team.pokemon],
      })

      generateAiTeam(team.pokemon.length)
      isInitialized.current = true
    }

    loadTeam()
  }, [teamId, teams, navigate, showModal])

  // Prevent navigation during battle or when modal is shown
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (battleInProgress || showModal) {
        // Standard way of showing a confirmation dialog
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [battleInProgress, showModal])

  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current = {
      playerWins,
      aiWins,
      battleHistory,
    }
  }, [playerWins, aiWins, battleHistory])

  const generateAiTeam = async (playerTeamSize) => {
    try {
      console.log("Generating AI team with size:", playerTeamSize)
      const randomOffset = Math.floor(Math.random() * 800)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${playerTeamSize}&offset=${randomOffset}`)
      const data = await response.json()

      const aiPokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url)
          return await res.json()
        }),
      )

      const aiTeamData = {
        id: "ai-team",
        name: "AI Team",
        pokemon: aiPokemonDetails,
        remainingPokemon: [...aiPokemonDetails],
      }

      setAiTeam(aiTeamData)
    } catch (error) {
      console.error("Error generating AI team:", error)
      // Replace alert with navigation
      navigate("/teams")
    }
  }

  const selectPokemon = (pokemon) => {
    if (gameOver) return
    console.log("Selected pokemon:", pokemon.name)
    setSelectedPokemon(pokemon)
    setBattleResult(null)
    setBattleLog([])
  }

  const handleGameOver = async (finalWinner, result, newPlayerTeam, newAiTeam, updatedBattleHistory) => {
    if (isGameOverHandled || battleSaved.current) return
    console.log("Game over! Winner:", finalWinner)

    setIsGameOverHandled(true)
    setGameOver(true)
    setWinner(finalWinner) // finalWinner is string "player" or "ai"
    setSavingBattle(true)

    try {
      // Save all battles in the history with complete information
      const simplifiedBattles = updatedBattleHistory.map((battle) => ({
        pokemon1: {
          id: battle.pokemon1.id,
          name: battle.pokemon1.name,
          sprite: battle.pokemon1.sprite,
          stats: battle.pokemon1.stats,
        },
        pokemon2: {
          id: battle.pokemon2.id,
          name: battle.pokemon2.name,
          sprite: battle.pokemon2.sprite,
          stats: battle.pokemon2.stats,
        },
        rounds: battle.rounds,
        winner: battle.winner,
        date: battle.date,
      }))

      // Create complete versions of Pokemon data
      const simplifiedPlayerTeam = {
        id: newPlayerTeam.id,
        name: newPlayerTeam.name,
        pokemon: newPlayerTeam.pokemon.map((p) => ({
          id: p.id,
          name: p.name,
          sprites: { front_default: p.sprites.front_default },
          types: p.types,
        })),
      }

      const simplifiedAiTeam = {
        id: newAiTeam.id,
        name: newAiTeam.name,
        pokemon: newAiTeam.pokemon.map((p) => ({
          id: p.id,
          name: p.name,
          sprites: { front_default: p.sprites.front_default },
          types: p.types,
        })),
      }

      // Calculate playerWins and aiWins correctly
      const calculatedPlayerWins = updatedBattleHistory.reduce(
        (count, battle) => (battle.winner && battle.winner.id === battle.pokemon1.id ? count + 1 : count),
        0,
      )

      const calculatedAiWins = updatedBattleHistory.reduce(
        (count, battle) => (battle.winner && battle.winner.id === battle.pokemon2.id ? count + 1 : count),
        0,
      )

      const battleToSave = {
        id: Date.now(),
        playerTeam: simplifiedPlayerTeam,
        aiTeam: simplifiedAiTeam,
        battles: simplifiedBattles,
        playerWins: calculatedPlayerWins,
        aiWins: calculatedAiWins,
        winner: finalWinner,
        date: new Date().toISOString(),
      }
      console.log("Saving battle:", battleToSave)

      // Mark as saved before the async operation
      battleSaved.current = true

      // Use await to ensure the battle is saved before showing the modal
      await saveBattle(battleToSave)
      console.log("Battle saved successfully!")
    } catch (error) {
      console.error("Failed to save battle:", error)
    } finally {
      setSavingBattle(false)
      // Now show the modal after saving attempt is complete
      setShowModal(true)
      modalResponsePending.current = true
    }
  }

  const startBattle = () => {
    if (gameOver) return
    if (!selectedPokemon) {
      // Replace alert with visual feedback
      console.error("No Pokémon selected")
      return
    }
    if (!aiTeam || !aiTeam.remainingPokemon || aiTeam.remainingPokemon.length === 0) {
      // Replace alert with visual feedback
      console.error("AI team is not ready")
      return
    }

    console.log("Starting battle...")
    setBattleInProgress(true)
    setBattleLog([])

    const randomIndex = Math.floor(Math.random() * aiTeam.remainingPokemon.length)
    const selectedAiPokemon = aiTeam.remainingPokemon[randomIndex]
    if (!selectedAiPokemon) {
      // Replace alert with visual feedback
      console.error("AI did not select a Pokémon")
      setBattleInProgress(false)
      return
    }
    setAiPokemon(selectedAiPokemon)

    setBattleLog((prev) => [
      ...prev,
      `Battle started between ${
        selectedPokemon?.name?.toUpperCase() || "UNKNOWN"
      } and ${selectedAiPokemon?.name?.toUpperCase() || "UNKNOWN"}!`,
    ])

    setTimeout(() => {
      const result = simulateBattle(selectedPokemon, selectedAiPokemon)
      setBattleResult(result)

      if (result.winner.id === selectedPokemon.id) {
        setAiPokemon(null)
      } else {
        setSelectedPokemon(null)
      }

      let newPlayerTeam, newAiTeam
      if (result.winner.id === selectedPokemon.id) {
        setPlayerWins((prev) => prev + 1)
        newAiTeam = {
          ...aiTeam,
          remainingPokemon: aiTeam.remainingPokemon.filter((p) => p.id !== selectedAiPokemon.id),
        }
        setAiTeam(newAiTeam)
        newPlayerTeam = playerTeam
      } else {
        setAiWins((prev) => prev + 1)
        newPlayerTeam = {
          ...playerTeam,
          remainingPokemon: playerTeam.remainingPokemon.filter((p) => p.id !== selectedPokemon.id),
        }
        setPlayerTeam(newPlayerTeam)
        newAiTeam = aiTeam
      }

      setBattleHistory((prev) => {
        const updatedBattleHistory = [...prev, result]

        setTimeout(() => {
          if (newPlayerTeam.remainingPokemon.length <= 0 || newAiTeam.remainingPokemon.length === 0) {
            const finalWinner =
              playerWins + (result.winner.id === selectedPokemon.id ? 1 : 0) >
              aiWins + (result.winner.id === selectedAiPokemon.id ? 1 : 0)
                ? "player"
                : "ai"

            handleGameOver(finalWinner, result, newPlayerTeam, newAiTeam, updatedBattleHistory)
            // Do not set battleInProgress to false here to keep modal visible
            return
          }

          setBattleInProgress(false)
        }, 1000)

        return updatedBattleHistory
      })
    }, 2000)
  }

  const backToTeams = () => {
    if (showModal || modalResponsePending.current || battleInProgress) {
      // Prevent navigation while modal is shown or battle is in progress
      return
    }

    console.log("Returning to teams...")
    navigate("/teams")
  }

  const simulateBattle = (pokemon1, pokemon2) => {
    const p1Stats = {
      hp: pokemon1.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: pokemon1.stats.find((s) => s.stat.name === "attack").base_stat,
      defense: pokemon1.stats.find((s) => s.stat.name === "defense").base_stat,
      speed: pokemon1.stats.find((s) => s.stat.name === "speed").base_stat,
    }

    const p2Stats = {
      hp: pokemon2.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: pokemon2.stats.find((s) => s.stat.name === "attack").base_stat,
      defense: pokemon2.stats.find((s) => s.stat.name === "defense").base_stat,
      speed: pokemon2.stats.find((s) => s.stat.name === "speed").base_stat,
    }

    const rounds = [
      {
        stat: "hp",
        winner: p1Stats.hp > p2Stats.hp ? pokemon1.id : p1Stats.hp < p2Stats.hp ? pokemon2.id : "tie",
      },
      {
        stat: "attack",
        winner: p1Stats.attack > p2Stats.attack ? pokemon1.id : p1Stats.attack < p2Stats.attack ? pokemon2.id : "tie",
      },
      {
        stat: "defense",
        winner:
          p1Stats.defense > p2Stats.defense ? pokemon1.id : p1Stats.defense < p2Stats.defense ? pokemon2.id : "tie",
      },
      {
        stat: "speed",
        winner: p1Stats.speed > p2Stats.speed ? pokemon1.id : p1Stats.speed < p2Stats.speed ? pokemon2.id : "tie",
      },
    ]

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
      `Round 3 (Defense): ${pokemon1.name.toUpperCase()} (${
        p1Stats.defense
      }) vs ${pokemon2.name.toUpperCase()} (${p2Stats.defense}) - ${
        rounds[2].winner === "tie"
          ? "TIE!"
          : rounds[2].winner === pokemon1.id
            ? `${pokemon1.name.toUpperCase()} wins!`
            : `${pokemon2.name} wins!`
      }`,
      `Round 4 (Speed): ${pokemon1.name.toUpperCase()} (${
        p1Stats.speed
      }) vs ${pokemon2.name.toUpperCase()} (${p2Stats.speed}) - ${
        rounds[3].winner === "tie"
          ? "TIE!"
          : rounds[3].winner === pokemon1.id
            ? `${pokemon1.name.toUpperCase()} wins!`
            : `${pokemon2.name.toUpperCase()} wins!`
      }`,
    ])

    let p1Wins = 0
    let p2Wins = 0

    rounds.forEach((round) => {
      if (round.winner === pokemon1.id) p1Wins++
      else if (round.winner === pokemon2.id) p2Wins++
    })

    let winner
    if (p1Wins > p2Wins) {
      winner = pokemon1
    } else if (p2Wins > p1Wins) {
      winner = pokemon2
    } else {
      const p1Total = p1Stats.hp + p1Stats.attack + p1Stats.defense + p1Stats.speed
      const p2Total = p2Stats.hp + p2Stats.attack + p2Stats.defense + p2Stats.speed

      winner = p1Total > p2Total ? pokemon1 : pokemon2
    }

    setBattleLog((prev) => [...prev, `${winner.name.toUpperCase()} is the winner!`])

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
    }
  }

  const handleContinue = () => {
    console.log("Continuing game...")
    setShowModal(false)
    modalResponsePending.current = false

    // Use setTimeout to ensure UI updates before state reset
    setTimeout(() => {
      setGameOver(false)
      setBattleResult(null)
      setBattleLog([])
      setSelectedPokemon(null)
      setAiPokemon(null)
      setPlayerWins(0)
      setAiWins(0)
      setBattleHistory([])
      battleSaved.current = false

      if (playerTeam) {
        setPlayerTeam({
          ...playerTeam,
          remainingPokemon: [...playerTeam.pokemon],
        })
      }
      if (aiTeam) {
        setAiTeam({
          ...aiTeam,
          remainingPokemon: [...aiTeam.pokemon],
        })
      }
      setWinner(null)
      setIsGameOverHandled(false)
    }, 50)
  }

  const closeModal = () => {
    console.log("Closing modal and navigating to history...")
    setShowModal(false)
    modalResponsePending.current = false

    // Use setTimeout to ensure state updates before navigation
    setTimeout(() => {
      navigate("/history")
    }, 50)
  }

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
    }

    return typeColors[type] || "bg-gray-400"
  }

  if (!playerTeam || !aiTeam) {
    return (
      <div className="min-h-screen bg-secondary-900 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Battle Arena</h1>

      <div className="mb-4">
        <button
          onClick={backToTeams}
          disabled={battleInProgress || showModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-4 disabled:bg-gray-400"
        >
          Back to Teams
        </button>
      </div>

      {gameOver && showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg shadow-lg p-6 max-w-md w-full text-center text-white space-y-6">
            <h2 className="text-3xl font-extrabold leading-tight">
              {winner === "player" ? "Congratulations! You Won!" : "You Lost! Want a rematch?"}
            </h2>
            <p className="text-lg">
              {winner === "player" ? `Your team defeated the AI team.` : `The AI team defeated your team.`}
            </p>
            <p className="text-lg">Do you want to continue playing?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleContinue}
                className="bg-green-600 text-white font-bold px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={closeModal}
                className="bg-white text-red-700 font-bold px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver ? null : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-secondary-800 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Your Team: {playerTeam.name}</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Remaining Pokémon:</span>
                  <span className="font-bold">
                    {playerTeam.remainingPokemon.length}/{playerTeam.pokemon.length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
                  <div
                    className="bg-red-600 h-4 rounded-full"
                    style={{
                      width: `${(playerTeam.remainingPokemon.length / playerTeam.pokemon.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {playerTeam.remainingPokemon.map((pokemon) => {
                  const primaryType = pokemon.types[0].type.name
                  const typeColorClass = getTypeColor(primaryType)
                  const isSelected = selectedPokemon?.id === pokemon.id

                  return (
                    <button
                      key={pokemon.id}
                      onClick={() => selectPokemon(pokemon)}
                      disabled={battleInProgress}
                      className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? `${typeColorClass} text-white` : "bg-secondary-700 hover:bg-secondary-600"
                      } ${battleInProgress ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center">
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
                                  isSelected ? "bg-white text-gray-800" : typeColorClass + " text-white"
                                } text-xs px-2 py-0.5 rounded-full capitalize`}
                              >
                                {typeInfo.type.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="bg-white text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-secondary-800 rounded-lg shadow-lg p-6 h-full text-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Battle Arena</h2>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">You: {playerWins}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">AI: {aiWins}</span>
                </div>
              </div>

              {!selectedPokemon && !aiPokemon ? (
                <div className="flex items-center justify-center h-64 bg-secondary-700 rounded-lg">
                  <p className="text-gray-400">Select a Pokémon from your team to battle</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div
                      className={`${getTypeColor(selectedPokemon?.types[0]?.type?.name)} rounded-lg p-4 text-center`}
                    >
                      {selectedPokemon && (
                        <>
                          <div className="flex justify-center">
                            <img
                              src={selectedPokemon.sprites.front_default || "/placeholder.svg"}
                              alt={selectedPokemon.name}
                              className="h-32 w-32 object-contain"
                            />
                          </div>
                          <h3 className="text-lg font-semibold capitalize mt-2">{selectedPokemon.name}</h3>
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {selectedPokemon.stats.slice(0, 4).map((stat) => (
                              <div key={stat.stat.name} className="text-center">
                                <p className="text-xs text-gray-600 capitalize">{stat.stat.name.replace("-", " ")}</p>
                                <p className="font-medium">{stat.base_stat}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className={`${getTypeColor(aiPokemon?.types[0]?.type?.name)} rounded-lg p-4 text-center`}>
                      {aiPokemon ? (
                        <>
                          <div className="flex justify-center">
                            <img
                              src={aiPokemon.sprites.front_default || "/placeholder.svg"}
                              alt={aiPokemon.name}
                              className="h-32 w-32 object-contain"
                            />
                          </div>
                          <h3 className="text-lg font-semibold capitalize mt-2">{aiPokemon.name}</h3>
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {aiPokemon.stats.slice(0, 4).map((stat) => (
                              <div key={stat.stat.name} className="text-center">
                                <p className="text-xs text-gray-600 capitalize">{stat.stat.name.replace("-", " ")}</p>
                                <p className="font-medium">{stat.base_stat}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">AI will select a Pokémon</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center mb-6 gap-4">
                    {!aiPokemon ? (
                      <button
                        onClick={startBattle}
                        disabled={!selectedPokemon || battleInProgress || showModal}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                      >
                        {battleInProgress ? (
                          <span className="flex items-center">
                            <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                            Battle in progress...
                          </span>
                        ) : (
                          "Start Battle"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedPokemon(null)
                          setAiPokemon(null)
                        }}
                        disabled={battleInProgress || showModal}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        Next Battle
                      </button>
                    )}
                  </div>

                  {battleLog.length > 0 && (
                    <div className="bg-secondary-700 rounded-lg p-4 mt-4 max-h-40 overflow-y-auto text-white">
                      <h3 className="font-semibold mb-2">Battle Log</h3>
                      <div className="space-y-2">
                        {battleLog.map((log, index) => (
                          <p key={index} className={log.includes("winner") ? "text-lg font-bold text-red-600" : ""}>
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default BattleArena

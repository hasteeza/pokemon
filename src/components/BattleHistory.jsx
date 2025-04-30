import ConfirmModal from "./ConfirmModal"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Clock,
  Trophy,
  Award,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Heart,
} from "lucide-react"
import { fetchBattles, deleteBattleById } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"

const BattleHistory = () => {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [battleToDelete, setBattleToDelete] = useState(null)
  const [clearingHistory, setClearingHistory] = useState(false)
  const [deletingBattle, setDeletingBattle] = useState(null)

  // State to track which battle details are expanded (only one at a time)
  const [expandedBattleId, setExpandedBattleId] = useState(null)

  useEffect(() => {
    fetchBattleHistory()
  }, [])

  const fetchBattleHistory = async () => {
    try {
      setLoading(true)
      const data = await fetchBattles()

      // Sort battles by date (newest first)
      const sortedBattles = data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setBattles(sortedBattles)
      setError(null)
    } catch (error) {
      console.error("Error fetching battle history:", error)
      setError("Failed to load battle history. Please try again later.")
      setBattles([])
    } finally {
      setLoading(false)
    }
  }

  const openClearModal = () => setIsClearModalOpen(true)
  const closeClearModal = () => setIsClearModalOpen(false)

  const openDeleteModal = (battle) => {
    setBattleToDelete(battle)
    setIsDeleteModalOpen(true)
  }
  const closeDeleteModal = () => {
    setBattleToDelete(null)
    setIsDeleteModalOpen(false)
  }

  // Update the handleClearHistory function to ensure all battles are properly deleted
  const handleClearHistory = async () => {
    try {
      setClearingHistory(true)
      const response = await fetch("http://localhost:3001/battles", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch battles: ${response.statusText}`)
      }

      const allBattles = await response.json()
      console.log(`Clearing ${allBattles.length} battles from history`)

      // Delete battles one by one with verification
      for (const battle of allBattles) {
        try {
          const deleteResponse = await fetch(`http://localhost:3001/battles/${battle.id}`, {
            method: "DELETE",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          })

          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            console.error(`Failed to delete battle ${battle.id}: ${deleteResponse.statusText}`)
          }

          // Small delay to ensure server processes the deletion
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (deleteError) {
          console.error(`Error deleting battle ${battle.id}:`, deleteError)
        }
      }

      // Verify all battles are deleted
      const verifyResponse = await fetch("http://localhost:3001/battles", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (verifyResponse.ok) {
        const remainingBattles = await verifyResponse.json()
        if (remainingBattles.length > 0) {
          console.warn(`${remainingBattles.length} battles still remain after clearing`)
        } else {
          console.log("All battles successfully cleared")
        }
      }

      setBattles([])
      closeClearModal()
    } catch (error) {
      console.error("Error clearing battle history:", error)
      setError(`Failed to clear history: ${error.message}`)
      closeClearModal()
    } finally {
      setClearingHistory(false)
    }
  }

  // Update the handleDeleteBattle function to better handle 404 errors
  const handleDeleteBattle = async () => {
    if (!battleToDelete) return
    console.log("Deleting battle with id:", battleToDelete.id)
    try {
      setDeletingBattle(battleToDelete.id)

      // Try to delete the battle
      try {
        await deleteBattleById(battleToDelete.id)
        console.log(`Successfully deleted battle with ID: ${battleToDelete.id}`)
      } catch (deleteError) {
        // If it's a 404 error, consider it already deleted
        if (deleteError.message && deleteError.message.includes("Not Found")) {
          console.log(`Battle with ID ${battleToDelete.id} not found, considering it already deleted`)
        } else {
          throw deleteError
        }
      }

      // Update the UI regardless of whether the battle was found or not
      setBattles((prev) => prev.filter((battle) => battle.id !== battleToDelete.id))
      closeDeleteModal()
    } catch (error) {
      console.error("Error deleting battle:", error)
      // Don't show error message for Not Found errors
      if (error.message && error.message.includes("Not Found")) {
        console.log("Battle was already deleted, updating UI")
        setBattles((prev) => prev.filter((battle) => battle.id !== battleToDelete.id))
        closeDeleteModal()
      } else {
        setError("Failed to delete battle. Please try again later.")
      }
    } finally {
      setDeletingBattle(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const expandVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { type: "spring", stiffness: 70, damping: 15 },
        opacity: { duration: 0.5 },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  }

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.5, repeat: 1, repeatType: "reverse" },
    },
  }

  const buttonHoverVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  }

  // Add a refresh function to the component
  const refreshBattleHistory = async () => {
    try {
      setLoading(true)
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`http://localhost:3001/battles?_=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to refresh battles: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Refreshed battle history: ${data.length} battles found`)

      // Sort battles by date (newest first)
      const sortedBattles = data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setBattles(sortedBattles)
      setError(null)
    } catch (error) {
      console.error("Error refreshing battle history:", error)
      setError("Failed to refresh battle history. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Add useEffect to refresh battle history when component mounts or when battles change
  useEffect(() => {
    // Add event listener for visibility change to refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab became visible, refreshing battle history")
        refreshBattleHistory()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-secondary-900">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          className="rounded-full h-16 w-16 border-4 border-secondary-700 border-t-red-600"
        ></motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-900 pt-16 px-4 sm:px-6 overflow-hidden"
    >
      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear Battle History"
        message="Are you sure you want to clear all battle history?"
        onConfirm={handleClearHistory}
        onCancel={closeClearModal}
        isLoading={clearingHistory}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Battle"
        message="Are you sure you want to delete this battle?"
        onConfirm={handleDeleteBattle}
        onCancel={closeDeleteModal}
        isLoading={deletingBattle !== null}
      />
      <div className="container-custom">
        <motion.div
          variants={fadeInVariants}
          className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg shadow-xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-b-4 border-red-600"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Trophy size={28} className="text-yellow-300 mr-2" />
              </motion.div>
              Battle History
            </h1>
            <p className="text-blue-100">Your record of Pokémon battles</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={refreshBattleHistory}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                ></motion.div>
              ) : (
                <RefreshCw size={18} />
              )}
              Refresh
            </motion.button>
            <motion.button
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={openClearModal}
              className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-md"
              disabled={clearingHistory}
            >
              {clearingHistory ? (
                <>
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  ></motion.div>
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Clear History
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {error ? (
          <motion.div
            variants={fadeInVariants}
            className="bg-secondary-800 rounded-lg shadow-lg p-8 text-center border border-red-800"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
              className="flex justify-center mb-4"
            >
              <AlertCircle size={64} className="text-red-500" />
            </motion.div>
            <h2 className="text-xl mb-4 text-white">{error}</h2>
            <motion.button
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={refreshBattleHistory}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw size={18} className="mr-2" />
              Try Again
            </motion.button>
          </motion.div>
        ) : battles.length === 0 ? (
          <motion.div variants={fadeInVariants} className="bg-secondary-800 rounded-lg shadow-lg p-12 text-center">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="flex justify-center mb-8"
            >
              <Trophy size={80} className="text-gray-500" />
            </motion.div>
            <h2 className="text-2xl mb-4 text-white font-bold">No battles yet!</h2>
            <p className="text-gray-400 mb-8">Start a battle to see your battle history.</p>
            <motion.div variants={buttonHoverVariants} initial="initial" whileHover="hover" whileTap={{ scale: 0.95 }}>
              <Link
                to="/teams"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-xl font-medium"
              >
                Go to Teams
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-6">
            {battles.map((battle) => (
              <motion.div
                key={battle.id}
                variants={itemVariants}
                className="bg-secondary-800 rounded-lg shadow-lg overflow-hidden transition-all border border-secondary-700 hover:border-blue-500"
                layout
              >
                <div className="bg-gradient-to-r from-secondary-700 to-secondary-800 text-white p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center">
                      <Trophy size={18} className="mr-2 text-yellow-400" />
                      {battle.playerTeam?.name} vs {battle.aiTeam?.name || "AI Team"}
                    </h2>
                    <span className="text-sm flex items-center text-gray-300">
                      <Clock size={16} className="mr-1 text-blue-300" />
                      {formatDate(battle.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      variants={buttonHoverVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openDeleteModal(battle)}
                      className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-secondary-900"
                      aria-label="Delete battle"
                      disabled={deletingBattle === battle.id}
                    >
                      {deletingBattle === battle.id ? (
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
                        ></motion.div>
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </motion.button>
                    <motion.button
                      variants={buttonHoverVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (expandedBattleId === battle.id) {
                          setExpandedBattleId(null)
                        } else {
                          setExpandedBattleId(battle.id)
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      aria-label="Toggle battle details"
                    >
                      {expandedBattleId === battle.id ? (
                        <>
                          Hide Details <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown size={16} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-300">Final Score:</span>
                      <motion.span
                        variants={pulseVariants}
                        initial="initial"
                        animate={battle.playerWins > battle.aiWins ? "pulse" : "initial"}
                        className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        Player: {battle.playerWins || 0}
                      </motion.span>
                      <motion.span
                        variants={pulseVariants}
                        initial="initial"
                        animate={battle.aiWins > battle.playerWins ? "pulse" : "initial"}
                        className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        AI: {battle.aiWins || 0}
                      </motion.span>
                    </div>
                    <motion.span
                      variants={pulseVariants}
                      initial="initial"
                      animate="pulse"
                      className={`font-bold flex items-center px-3 py-1 rounded-full ${
                        battle.winner === "player" ? "text-green-200 bg-green-900/50" : "text-red-200 bg-red-900/50"
                      }`}
                    >
                      <Award size={18} className="mr-1" />
                      {battle.winner === "player" ? "You Won!" : "AI Won!"}
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {expandedBattleId === battle.id && (
                      <motion.div
                        key={`details-${battle.id}`}
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        {/* Full Teams Display */}
                        <motion.div
                          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {/* Player Team */}
                          <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg p-8 shadow-lg border-t-4 border-blue-500">
                            <h3 className="font-extrabold mb-6 text-gray-900 text-2xl border-b border-gray-300 pb-4 flex items-center">
                              <Shield size={22} className="text-blue-500 mr-2" />
                              Your Team
                            </h3>
                            <div className="grid grid-cols-3 gap-6 justify-center">
                              {battle.playerTeam?.pokemon?.map((pokemon, index) => (
                                <motion.div
                                  key={pokemon.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * index }}
                                  whileHover={{
                                    y: -5,
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                  }}
                                  className="bg-gray-100 rounded-lg p-4 w-auto flex flex-col items-center shadow-md cursor-pointer"
                                >
                                  <motion.img
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ rotate: [-2, 2, -2, 0] }}
                                    transition={{
                                      rotate: { repeat: 1, duration: 0.3 },
                                    }}
                                    src={pokemon.sprites.front_default || "/placeholder.svg"}
                                    alt={pokemon.name}
                                    className="w-24 h-24 object-contain"
                                  />
                                  <h4 className="text-base font-bold capitalize mt-2 text-gray-900">{pokemon.name}</h4>
                                  <div className="flex gap-2 mt-4 flex-wrap justify-center">
                                    {pokemon.types.map((typeInfo) => (
                                      <span
                                        key={typeInfo.type.name}
                                        className="text-xs bg-blue-600 rounded-full px-2 py-1 text-white capitalize"
                                      >
                                        {typeInfo.type.name}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* AI Team */}
                          <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg p-8 shadow-lg border-t-4 border-red-500">
                            <h3 className="font-extrabold mb-6 text-gray-900 text-2xl border-b border-gray-300 pb-4 flex items-center">
                              <Shield size={22} className="text-red-500 mr-2" />
                              AI Team
                            </h3>
                            <div className="grid grid-cols-3 gap-6 justify-center">
                              {battle.aiTeam?.pokemon?.map((pokemon, index) => (
                                <motion.div
                                  key={pokemon.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * index }}
                                  whileHover={{
                                    y: -5,
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                  }}
                                  className="bg-gray-100 rounded-lg p-4 w-auto flex flex-col items-center shadow-md cursor-pointer"
                                >
                                  <motion.img
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ rotate: [-2, 2, -2, 0] }}
                                    transition={{
                                      rotate: { repeat: 1, duration: 0.3 },
                                    }}
                                    src={pokemon.sprites.front_default || "/placeholder.svg"}
                                    alt={pokemon.name}
                                    className="w-24 h-24 object-contain"
                                  />
                                  <h4 className="text-base font-bold capitalize mt-2 text-gray-900">{pokemon.name}</h4>
                                  <div className="flex gap-2 mt-4 flex-wrap justify-center">
                                    {pokemon.types.map((typeInfo) => (
                                      <span
                                        key={typeInfo.type.name}
                                        className="text-xs bg-red-600 rounded-full px-2 py-1 text-white capitalize"
                                      >
                                        {typeInfo.type.name}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {battle.battles && battle.battles.length > 0 ? (
                          <motion.div
                            className="mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <h3 className="font-bold mb-6 text-white text-2xl border-b border-gray-700 pb-3 flex items-center">
                              <Zap size={22} className="text-yellow-400 mr-2" />
                              Individual Battles
                            </h3>
                            <motion.div className="space-y-4" variants={containerVariants}>
                              {battle.battles.map((individualBattle, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * idx }}
                                  whileHover={{ scale: 1.02 }}
                                  className="border border-gray-200 rounded-lg p-6 bg-white shadow-md"
                                >
                                  <div className="grid grid-cols-2 gap-8">
                                    <div className="flex items-center gap-6">
                                      <motion.img
                                        whileHover={{
                                          scale: 1.1,
                                          rotate: [-3, 3, -3, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                        src={individualBattle.pokemon1.sprite || "/placeholder.svg"}
                                        alt={individualBattle.pokemon1.name}
                                        className="w-20 h-20 rounded-md bg-gray-100 p-2"
                                      />
                                      <div>
                                        <h4 className="font-bold capitalize text-gray-900">
                                          {individualBattle.pokemon1.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">#{individualBattle.pokemon1.id}</p>
                                        {individualBattle.winner &&
                                          individualBattle.winner.id === individualBattle.pokemon1.id && (
                                            <motion.span
                                              initial={{ opacity: 0, scale: 0.5 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              className="text-green-600 text-base font-semibold flex items-center"
                                            >
                                              <Trophy size={16} className="mr-1" /> Winner
                                            </motion.span>
                                          )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <motion.img
                                        whileHover={{
                                          scale: 1.1,
                                          rotate: [-3, 3, -3, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                        src={individualBattle.pokemon2.sprite || "/placeholder.svg"}
                                        alt={individualBattle.pokemon2.name}
                                        className="w-20 h-20 rounded-md bg-gray-100 p-2"
                                      />
                                      <div>
                                        <h4 className="font-bold capitalize text-gray-900">
                                          {individualBattle.pokemon2.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">#{individualBattle.pokemon2.id}</p>
                                        {individualBattle.winner &&
                                          individualBattle.winner.id === individualBattle.pokemon2.id && (
                                            <motion.span
                                              initial={{ opacity: 0, scale: 0.5 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              className="text-green-600 text-base font-semibold flex items-center"
                                            >
                                              <Trophy size={16} className="mr-1" /> Winner
                                            </motion.span>
                                          )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Battle rounds details */}
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="font-semibold text-gray-700 mb-2">Battle Rounds</h5>
                                    <div className="grid grid-cols-4 gap-2">
                                      {individualBattle.rounds &&
                                        individualBattle.rounds.map((round, roundIdx) => (
                                          <div
                                            key={roundIdx}
                                            className={`p-2 rounded-md text-center ${
                                              round.winner === individualBattle.pokemon1.id
                                                ? "bg-blue-100 text-blue-800"
                                                : round.winner === individualBattle.pokemon2.id
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-gray-100 text-gray-800"
                                            }`}
                                          >
                                            <p className="text-xs font-medium uppercase">{round.stat}</p>
                                            <p className="text-sm font-bold capitalize">
                                              {round.winner === "tie"
                                                ? "Tie"
                                                : round.winner === individualBattle.pokemon1.id
                                                  ? individualBattle.pokemon1.name
                                                  : individualBattle.pokemon2.name}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <h3 className="font-bold mb-6 text-white text-2xl border-b border-gray-700 pb-3 flex items-center">
                              <Zap size={22} className="text-yellow-400 mr-2" />
                              Battle Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className={`rounded-lg p-6 ${
                                  battle.winner && battle.winner.id === battle.pokemon1.id
                                    ? "bg-gradient-to-br from-green-100 to-green-50 border-l-4 border-green-400"
                                    : "bg-gradient-to-br from-gray-100 to-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-6">
                                  <motion.img
                                    whileHover={{
                                      scale: 1.1,
                                      rotate: [-5, 5, -5, 0],
                                    }}
                                    transition={{ duration: 0.5 }}
                                    src={battle.pokemon1.sprite || "/placeholder.svg"}
                                    alt={battle.pokemon1.name}
                                    className="w-24 h-24 rounded-lg shadow-md bg-white p-2"
                                  />
                                  <div>
                                    <h3 className="font-bold capitalize text-lg text-gray-900">
                                      {battle.pokemon1.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">#{battle.pokemon1.id}</p>
                                    {battle.winner && battle.winner.id === battle.pokemon1.id && (
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-green-600 font-semibold flex items-center bg-green-100 px-2 py-1 rounded-full mt-1 text-sm"
                                      >
                                        <Trophy size={14} className="mr-1" />
                                        Winner
                                      </motion.span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-center bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    <p className="text-sm text-gray-500 flex justify-center items-center">
                                      <Heart size={14} className="mr-1 text-red-500" />
                                      HP
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">{battle.pokemon1.stats.hp}</p>
                                  </motion.div>
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    <p className="text-sm text-gray-500 flex justify-center items-center">
                                      <Zap size={14} className="mr-1 text-yellow-500" />
                                      Attack
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">{battle.pokemon1.stats.attack}</p>
                                  </motion.div>
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="text-center bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    <p className="text-sm text-gray-500">Speed</p>
                                    <p className="font-bold text-gray-900 text-lg">{battle.pokemon1.stats.speed}</p>
                                  </motion.div>
                                </div>
                              </motion.div>

                              <motion.div
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className={`rounded-lg p-6 ${
                                  battle.winner && battle.winner.id === battle.pokemon2.id
                                    ? "bg-gradient-to-br from-green-100 to-green-50 border-r-4 border-green-400"
                                    : "bg-gradient-to-br from-gray-100 to-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-6">
                                  <motion.img
                                    whileHover={{
                                      scale: 1.1,
                                      rotate: [-5, 5, -5, 0],
                                    }}
                                    transition={{ duration: 0.5 }}
                                    src={battle.pokemon2.sprite || "/placeholder.svg"}
                                    alt={battle.pokemon2.name}
                                    className="w-24 h-24 rounded-lg shadow-md bg-white p-2"
                                  />
                                  <div>
                                    <h3 className="font-bold capitalize text-lg text-gray-900">
                                      {battle.pokemon2.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">#{battle.pokemon2.id}</p>
                                    {battle.winner && battle.winner.id === battle.pokemon2.id && (
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-green-600 font-semibold flex items-center bg-green-100 px-2 py-1 rounded-full mt-1 text-sm"
                                      >
                                        <Trophy size={14} className="mr-1" />
                                        Winner
                                      </motion.span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-center bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    <p className="text-sm text-gray-500 flex justify-center items-center">
                                      <Heart size={14} className="mr-1 text-red-500" />
                                      HP
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">{battle.pokemon2.stats.hp}</p>
                                  </motion.div>
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    <p className="text-sm text-gray-500 flex justify-center items-center">
                                      <Zap size={14} className="mr-1 text-yellow-500" />
                                      Attack
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">{battle.pokemon2.stats.attack}</p>
                                  </motion.div>
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="text-center bg-white p-3 rounded-lg shadow-sm"
                                  >
                                    <p className="text-sm text-gray-500">Speed</p>
                                    <p className="font-bold text-gray-900 text-lg">{battle.pokemon2.stats.speed}</p>
                                  </motion.div>
                                </div>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default BattleHistory

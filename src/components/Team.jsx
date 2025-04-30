import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Team = ({ team, removeFromTeam }) => {
  const [hoveredPokemon, setHoveredPokemon] = useState(null);

  // Get background color based on Pokemon's primary type
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

  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="py-6">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Pokémon Team
      </motion.h1>

      {team.length === 0 ? (
        <motion.div
          className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl mb-4 font-bold">Your team is empty!</h2>
          <p className="text-gray-600 mb-6">
            Browse the Pokédex and add some Pokémon to your team.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block font-medium"
            >
              Go to Pokédex
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Team Status</h2>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <motion.div
                  className="bg-red-600 h-5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(team.length / 6) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
              </div>
              <span className="ml-4 font-medium">{team.length}/6</span>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {team.map((pokemon) => {
              const primaryType = pokemon.types[0].type.name;
              const typeColorClass = getTypeColor(primaryType);

              return (
                <motion.div
                  key={pokemon.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300"
                  variants={item}
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  onMouseEnter={() => setHoveredPokemon(pokemon.id)}
                  onMouseLeave={() => setHoveredPokemon(null)}
                >
                  <div
                    className={`${typeColorClass} h-3 transition-all duration-300 ${
                      hoveredPokemon === pokemon.id ? "h-4" : ""
                    }`}
                  ></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold capitalize">
                        {pokemon.name}
                      </h2>
                      <span className="text-gray-500 font-semibold">
                        #{pokemon.id.toString().padStart(3, "0")}
                      </span>
                    </div>

                    <div className="flex justify-center my-4 relative">
                      <motion.img
                        src={
                          pokemon.sprites.other["official-artwork"]
                            .front_default || pokemon.sprites.front_default
                        }
                        alt={pokemon.name}
                        className="h-36 w-36 object-contain"
                        initial={{ scale: 0.9 }}
                        animate={{
                          scale: hoveredPokemon === pokemon.id ? 1.1 : 1,
                          y: hoveredPokemon === pokemon.id ? -5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      {pokemon.types.map((typeInfo) => (
                        <motion.span
                          key={typeInfo.type.name}
                          className={`${getTypeColor(
                            typeInfo.type.name
                          )} text-white text-xs px-3 py-1 rounded-full capitalize`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {typeInfo.type.name}
                        </motion.span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {pokemon.stats.slice(0, 6).map((stat) => (
                        <div key={stat.stat.name} className="text-center">
                          <span className="text-xs text-gray-500 capitalize block">
                            {stat.stat.name.replace("-", " ")}
                          </span>
                          <p className="font-medium">{stat.base_stat}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className={`${typeColorClass} h-1 rounded-full`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (stat.base_stat / 150) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-5 space-x-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Link
                          to={`/pokemon/${pokemon.id}`}
                          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors block text-center"
                        >
                          Details
                        </Link>
                      </motion.div>
                      <motion.button
                        onClick={() => removeFromTeam(pokemon.id)}
                        className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors flex-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Remove
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {team.length >= 2 && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  to="/battle"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg font-bold shadow-lg"
                >
                  Battle Simulator
                </Link>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Team;

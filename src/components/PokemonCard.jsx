import { Link } from "react-router-dom";
import { Heart } from "./Icons";

const PokemonCard = ({ pokemon, onAddToTeam, toggleFavorite, isFavorite }) => {
  const { id, name, sprites, types } = pokemon;
  const favorited = isFavorite ? isFavorite(id) : false;

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

  const primaryType = types[0].type.name;
  const typeColorClass = getTypeColor(primaryType);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
      <div className={`${typeColorClass} h-2`}></div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold capitalize">{name}</h2>
          <span className="text-gray-500 font-semibold">
            #{id.toString().padStart(3, "0")}
          </span>
        </div>

        <div className="flex justify-center my-4 relative">
          <img
            src={
              sprites.other["official-artwork"].front_default ||
              sprites.front_default
            }
            alt={name}
            className="h-32 w-32 object-contain"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(pokemon);
            }}
            className="absolute top-0 right-0 p-1"
            aria-label={
              favorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart filled={favorited} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {types.map((typeInfo) => (
            <span
              key={typeInfo.type.name}
              className={`${getTypeColor(
                typeInfo.type.name
              )} text-white text-xs px-2 py-1 rounded-full capitalize`}
            >
              {typeInfo.type.name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {pokemon.stats.slice(0, 3).map((stat) => (
            <div key={stat.stat.name}>
              <span className="text-xs text-gray-500 capitalize">
                {stat.stat.name.replace("-", " ")}
              </span>
              <p className="font-medium">{stat.base_stat}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Link
            to={`/pokemon/${id}`}
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
          >
            Details
          </Link>
          <button
            onClick={onAddToTeam}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
          >
            Add to Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;

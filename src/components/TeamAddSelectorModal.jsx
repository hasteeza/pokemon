import React, { useState, useEffect } from "react";

const TeamAddSelectorModal = ({ teams, onSelect, onCreate, onClose }) => {
  const [creatingNew, setCreatingNew] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!creatingNew) {
      setNewTeamName("");
      setError(null);
    }
  }, [creatingNew]);

  const handleCreate = () => {
    if (!newTeamName.trim()) {
      setError("Please enter a team name");
      return;
    }
    onCreate(newTeamName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-lg p-4">
      <div className="bg-gradient-to-r from-purple-900 via-pink-800 to-red-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-white border border-pink-600 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-widest drop-shadow-lg">
            {creatingNew ? "Create a New Team" : "Select a Team"}
          </h2>
          <button
            onClick={onClose}
            className="text-pink-400 hover:text-pink-600 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {creatingNew ? (
          <>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name..."
              maxLength={20}
              autoFocus
              className="w-full px-5 py-3 mb-5 bg-pink-900 bg-opacity-80 border border-pink-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500 placeholder-pink-300 text-white shadow-inner"
              aria-label="New team name"
            />
            {error && (
              <p
                className="text-pink-400 mb-5 text-center font-semibold"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setCreatingNew(false)}
                className="px-6 py-3 rounded-full bg-pink-600 bg-opacity-80 hover:bg-pink-700 text-pink-100 font-bold shadow-md transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-3 rounded-full bg-pink-900 hover:bg-pink-800 text-white font-bold shadow-lg transition duration-300"
              >
                Create Team
              </button>
            </div>
          </>
        ) : (
          <>
            {teams.length === 0 ? (
              <p className="text-center py-6 text-lg font-semibold text-pink-300">
                No teams available. Create a team first.
              </p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto mb-6">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => onSelect(team.id)}
                    className="w-full text-left p-4 rounded-2xl hover:bg-pink-700 bg-pink-900 bg-opacity-70 flex justify-between items-center text-lg font-semibold tracking-wide transition-colors shadow-md"
                  >
                    <div>
                      <span>{team.name}</span>
                      <p className="text-sm text-pink-300">
                        {team.pokemon?.length || 0}/6 Pokémon
                      </p>
                    </div>
                    {team.pokemon?.length >= 6 && (
                      <span className="text-xs bg-pink-800 text-pink-200 px-3 py-1 rounded-full">
                        Full
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="text-center">
              <button
                onClick={() => setCreatingNew(true)}
                className="px-6 py-3 rounded-full bg-pink-700 hover:bg-pink-600 text-white font-bold shadow-lg transition duration-300 text-lg tracking-wide"
              >
                + Create New Team
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamAddSelectorModal;

"use client";

const TeamSelector = ({ teams, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select a Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {teams.length === 0 ? (
          <p className="text-center py-4">
            No teams available. Create a team first.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelect(team.id)}
                className="w-full text-left p-3 rounded-md hover:bg-gray-100 flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{team.name}</span>
                  <p className="text-sm text-gray-500">
                    {team.pokemon?.length || 0}/6 Pokémon
                  </p>
                </div>
                {team.pokemon?.length >= 6 && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Full
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelector;

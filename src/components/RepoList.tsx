import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import font-awesome for icons

interface Repo {
  name: string;
  url: string;
  description?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

interface RepoListProps {
  repos: Repo[];
  onSelectAddRepo: () => void;
  onEditRepo: (repo: Repo) => void;
  onDeleteRepo: (repoName: string) => void; // Add delete handler
  onSelectRepo: (repoName: string, repoUrl: string) => void;
  selectedRepo: string | null;
}

const RepoList: React.FC<RepoListProps> = ({
  repos,
  onSelectAddRepo,
  onEditRepo,
  onDeleteRepo, // Include delete handler in props
  onSelectRepo,
  selectedRepo,
}) => {
  return (
    <div className="flex justify-start p-6">
      <div className="w-full max-w-md">
        <button
          onClick={onSelectAddRepo}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Add Repository
        </button>
        <ul className="space-y-4">
          {repos.map((repo) => (
            <li
              key={repo.name}
              className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm ${
                repo.name === selectedRepo ? 'bg-blue-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-900">{repo.name}</span>
                <button
                  onClick={() => onSelectRepo(repo.name, repo.url)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-300"
                  aria-label={`Select ${repo.name}`}
                >
                  <i className="fas fa-eye text-lg"></i>
                </button>
                <button
                  onClick={() => onEditRepo(repo)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-300"
                  aria-label={`Edit ${repo.name}`}
                >
                  <i className="fas fa-edit text-lg"></i>
                </button>
                <button
                  onClick={() => onDeleteRepo(repo.name)} // Call delete handler
                  className="p-2 bg-gray-100 text-red-600 rounded-full hover:bg-red-200 transition duration-300"
                  aria-label={`Delete ${repo.name}`}
                >
                  <i className="fas fa-trash text-lg"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RepoList;
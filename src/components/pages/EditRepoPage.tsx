import React, { useState, useEffect } from 'react';
import RepoForm from '@/components/RepoForm';

interface Repo {
  name: string;
  url: string;
  description?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

interface EditRepoPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onCloseRepo: (updatedRepo: Repo) => Promise<void>;
  repo: Repo | null;
}

const EditRepoPage: React.FC<EditRepoPageProps> = ({ isOpen, onClose, onSave, onCloseRepo, repo }) => {
  const [formData, setFormData] = useState({
    repo_name: repo?.name || '',
    url: repo?.url || '',
    description: repo?.description || '',
    comments: repo?.comments || '',
  });

  // Update formData when repo prop changes
  useEffect(() => {
    if (repo) {
      setFormData({
        repo_name: repo.name,
        url: repo.url,
        description: repo.description || '',
        comments: repo.comments || '',
      });
    }
  }, [repo]);

  const handleSave = async () => {
    const closeRepo: Repo = {
      name: formData.repo_name,
      url: formData.url,
      description: formData.description,
      comments: formData.comments,
    };
    await onCloseRepo(closeRepo); // Update the repository
    await onSave(); // Perform any additional save operations
    onClose(); // Close the modal
  };

  if (!isOpen) {
    return null; // Don't render anything if the modal is closed
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h1>Edit Repository</h1>
        <RepoForm
          repoName={formData.repo_name}
          url={formData.url}
          description={formData.description}
          comments={formData.comments}
          onClose={onClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default EditRepoPage;

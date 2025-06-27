import React from 'react';
import RepoForm from '@/components/RepoForm';

interface Repo {
  name: string;
  url: string;
  description?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateRepoPageProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRepo: (newRepo: Repo) => void;
  onSave: () => void;
}

const CreateRepoPage: React.FC<CreateRepoPageProps> = ({ isOpen, onClose, onSave, onAddRepo }) => {
  if (!isOpen) {
    return null; // Don't render anything if the modal is closed
  }

  const handleSave = async () => {
    // Assuming `formData` is collected here
    const newRepo: Repo = {
      name: 'New Repo',
      url: 'http://example.com',
      // Add other fields as necessary
    };
    await onAddRepo(newRepo); // Add the new repository
    await onSave(); // Perform any additional save operations
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h1>Create Repository</h1>
        <RepoForm onClose={onClose} onSave={handleSave} />
      </div>
    </div>
  );
};

export default CreateRepoPage;

import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css'; // Σιγουρευτείτε ότι έχετε το Modal.css αρχείο με το ενημερωμένο CSS

const backendAPI = "http://localhost:5000";

interface RepoFormProps {
  repoName?: string;
  url?: string;
  description?: string;
  comments?: string;
  onClose: () => void;
  onSave: () => void;
}

const RepoForm: React.FC<RepoFormProps> = ({
  repoName,
  url,
  description,
  comments,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    repo_name: repoName || '',
    url: url || '',
    description: description || '',
    comments: comments || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    try {
      const response = await axios.post(`${backendAPI}/repos`, formData);
      console.log('Success:', response.data);
      onSave(); // Trigger the onSave callback after successful creation
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the repository.');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`${backendAPI}/repos/${formData.repo_name}`, {
        url: formData.url,
        description: formData.description,
        comments: formData.comments
      });
      console.log('Success:', response.data);
      onSave(); // Trigger the onSave callback after successful update
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while updating the repository.');
    }
  };

  const handleSave = () => {
    if (repoName) {
      handleUpdate(); // Call update function if repoName is provided
    } else {
      handleCreate(); // Call create function if repoName is not provided
    }
    onClose(); // Close the form after save
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>{repoName ? 'Edit Repository' : 'Create Repository'}</h1>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            name="repo_name"
            value={formData.repo_name}
            onChange={handleInputChange}
            placeholder="Repository Name"
            required
          />
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="URL"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
          />
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            placeholder="Comments"
          />
        </div>
        <div className="modal-footer">
          <button onClick={handleSave}>
            {repoName ? 'Update Repo' : 'Create Repo'}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepoForm;

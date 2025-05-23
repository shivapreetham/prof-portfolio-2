'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FileText, Calendar, Upload, Link2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadFile } from '@/utils/uploadFile';
import axios from 'axios';

export const AddResearchPaper = ({ isOpen, onClose, editingPaper, onPaperAdded }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    pdfUrl: '',
    publishedAt: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (editingPaper) {
      setFormData({
        title: editingPaper.title || '',
        abstract: editingPaper.abstract || '',
        pdfUrl: editingPaper.pdfUrl || '',
        publishedAt: new Date(editingPaper.publishedAt).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        abstract: '',
        pdfUrl: '',
        publishedAt: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingPaper]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setIsUploading(true);

    try {
      const result = await uploadFile(file, {
        bucketName: 'files',
        folderPath: 'pdfs',
        maxFileSize: 20 * 1024 * 1024 // 20MB
      });
      if (result.success) {
        setFormData((prev) => ({ ...prev, pdfUrl: result.url }));
        toast.success('PDF uploaded successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.abstract) {
      toast.error('Title and abstract are required');
      return;
    }
    try {
      let response;
      if (editingPaper) {
        response = await axios.put(`/api/research-papers/${editingPaper._id}`, formData);
      } else {
        response = await axios.post('/api/research-papers', formData);
      }
      
      onPaperAdded();
      onClose();
      toast.success('Research paper saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save paper');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="card bg-base-300 shadow-lg max-w-2xl mt-5">
      <div className="card-body p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="card-title text-base mb-2">
            {editingPaper ? 'Edit Research Paper' : 'Add New Research Paper'}
          </h3>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm">Title</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-sm input-bordered w-full"
              placeholder="Enter paper title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm">Abstract</span>
            </label>
            <textarea
              name="abstract"
              className="textarea textarea-bordered textarea-sm w-full h-32"
              placeholder="Enter paper abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm">PDF Document</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="application/pdf"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </button>
                {isUploading && <span className="loading loading-spinner loading-sm"></span>}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-base-content/20"></div>
                <span className="text-xs text-base-content/50">OR</span>
                <div className="flex-1 h-px bg-base-content/20"></div>
              </div>

              <label className="input input-sm input-bordered flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <input
                  type="url"
                  name="pdfUrl"
                  className="grow bg-transparent outline-none text-sm"
                  placeholder="Enter PDF URL"
                  value={formData.pdfUrl}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm">Publication Date</span>
            </label>
            <input
              type="date"
              name="publishedAt"
              className="input input-sm input-bordered w-full"
              value={formData.publishedAt}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="card-actions justify-end mt-4">
            <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={isUploading}>{editingPaper ? 'Save Changes' : 'Add Paper'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
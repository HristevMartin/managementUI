'use client';

import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { CalendarIcon, Plus, X, Edit, ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useModal } from "@/context/useModal";

interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  projectDate: string;
  specifications?: string[];
  expertise?: string[];
  images?: string[];
  projectImages?: string[];
  userId: string;
  created_at: string;
  updated_at: string;
}

function ChangeProjectSidePanel() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [specifications, setSpecifications] = useState<string[]>([]);
  const [currentSpec, setCurrentSpec] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showModal } = useModal();
  const { data: session } = useSession();
  let userId = (session?.user as any)?.id;
  console.log('show me the user id', userId);

  // Fetch user's single project
  useEffect(() => {
    const fetchProject = async () => {
      if (!userId) {
        console.log('No userId available, skipping fetch');
        setLoading(false);
        return;
      }
      
      // TODO: How do we determine the project_id for this user?
      // For now, assuming project_id = userId or we need another way to get project_id
      const projectId = userId; // This might need to be changed based on your logic
      
      console.log('Fetching project for projectId:', projectId);
      console.log('UserId:', userId);
      const apiUrl = `${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/travel/get-project-by-id/${projectId}?userId=${userId}`;
      console.log('API URL:', apiUrl);
      
      try {
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Raw API response:', data);
          
          if (data) {
            setProject(data);
            populateForm(data);
          } else {
            console.log('No project data received');
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch project, status:', response.status);
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [userId]);

  const populateForm = (projectData: Project) => {
    console.log('Populating form with project:', projectData);
    setTitle(projectData.title);
    setDesc(projectData.description);
    setDate(projectData.projectDate);
    
    // Handle both specifications and expertise field names
    const projectSpecs = projectData.specifications || projectData.expertise || [];
    setSpecifications(projectSpecs);
    
    // Handle both images and projectImages field names
    const projectImages = projectData.images || projectData.projectImages || [];
    setExistingImages(projectImages);
    
    setPreviews([]);
    setImages([]);
  };

  const handleAddSpecification = () => {
    console.log('Current spec:', currentSpec);
    console.log('Current specifications:', specifications);
    
    if (currentSpec.trim() && !specifications.includes(currentSpec.trim())) {
      const newSpecs = [...specifications, currentSpec.trim()];
      console.log('Adding new spec, updated array will be:', newSpecs);
      setSpecifications(newSpecs);
      setCurrentSpec("");
    } else {
      console.log('Spec not added - either empty or duplicate');
    }
  };

  const handleRemoveSpecification = (specToRemove: string) => {
    setSpecifications(prev => prev.filter(spec => spec !== specToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecification();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length + images.length + existingImages.length > 5) {
      alert("You can upload a maximum of 5 images total");
      return;
    }
    const newImages = [...images, ...files];
    const newPreviews = [...previews, ...files.map(f => URL.createObjectURL(f))];
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleRemoveNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleRemoveExistingImage = (imageToRemove: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageToRemove));
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;

    // Use _id if available, otherwise fallback to id
    const projectId = project._id || project.id;
    if (!projectId) {
      console.error('No project ID available');
      showModal('error', 'Invalid project ID');
      return;
    }

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('projectDate', date);
    formData.append('specifications', JSON.stringify(specifications));
    formData.append('existingImages', JSON.stringify(existingImages));
    formData.append('userId', userId);

    // Append new image files
    images.forEach((image) => {
      formData.append('newProjectImages', image);
    });

    console.log('Update payload:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/travel/update-project/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        showModal('success', 'Project updated successfully');
        
        // Refresh the single project
        const projectResponse = await fetch(`${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/travel/get-project-by-id/${userId}`);
        if (projectResponse.ok) {
          const data = await projectResponse.json();
          setProject(data);
          populateForm(data);
        }
      } else {
        console.error('Failed to update project');
        showModal('error', 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      showModal('error', 'Error updating project');
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-purple-100 text-purple-800 border-purple-200", 
      "bg-green-100 text-green-800 border-green-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-amber-100 text-amber-800 border-amber-200"
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600">Loading your project...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="text-center">
                <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
                  Edit Your Project
                </CardTitle>
                <p className="text-white/90 text-xs sm:text-sm px-2">
                  No project found for this user
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Edit className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Found</h3>
              <p className="text-gray-600 mb-6">No project found for this user. Create your first project to get started.</p>
              <Button 
                onClick={() => window.location.href = `${window.location.pathname.replace('/change-project', '/create-project')}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
              >
                Create First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-4 sm:p-6 lg:p-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.location.href = '/projects/add'}
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              <Edit className="w-5 h-5" />
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
                Edit Project: {project.title}
              </CardTitle>
              <p className="text-white/90 text-xs sm:text-sm px-2">
                Update your project details
              </p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleUpdateProject}>
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Project Title and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3">
                <label htmlFor="projectTitle" className="block text-sm font-semibold text-gray-700">
                  Project Title *
                </label>
                <Input
                  id="projectTitle"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Complete Room Renovation"
                  className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3 h-10 sm:h-12"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                  Project Date *
                </label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3 h-10 sm:h-12 pr-12"
                    required
                  />
                  <CalendarIcon className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            {/* Project Specifications */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Project Specifications
              </label>
              
              <div className="flex gap-3">
                <Input
                  value={currentSpec}
                  onChange={e => setCurrentSpec(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. Wall Texturing, Flooring Installation, Custom Lighting..."
                  className="flex-1 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3 h-10 sm:h-12"
                />
                <Button
                  type="button"
                  onClick={handleAddSpecification}
                  disabled={!currentSpec.trim()}
                  className="px-4 py-3 h-10 sm:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>
              
              {specifications.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 font-medium">Current Specifications:</p>
                  <div className="flex flex-wrap gap-2">
                    {specifications.map((spec, index) => (
                      <div
                        key={spec}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:shadow-md ${getTagColor(index)}`}
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(spec)}
                          className="ml-1 hover:bg-black/10 rounded-full p-1 transition-colors duration-200"
                          title="Remove specification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-3">
              <label htmlFor="desc" className="block text-sm font-semibold text-gray-700">
                Project Description *
              </label>
              <Textarea
                id="desc"
                rows={5}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe your project in detail..."
                className="resize-none rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200"
                required
              />
            </div>

            {/* Image Management */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Project Images
              </label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-3">Current Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
                    {existingImages.map((imageUrl, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={imageUrl} 
                          alt={`Existing project image ${idx + 1}`} 
                          className="w-full h-20 sm:h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm" 
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={12} className="sm:hidden" />
                          <X size={14} className="hidden sm:block" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images */}
              <div>
                {previews.length > 0 && <p className="text-sm text-gray-600 font-medium mb-3">New Images to Add:</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={url} 
                        alt={`New project preview ${idx + 1}`} 
                        className="w-full h-20 sm:h-24 object-cover rounded-xl border-2 border-indigo-200 shadow-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        title="Remove image"
                      >
                        <X size={12} className="sm:hidden" />
                        <X size={14} className="hidden sm:block" />
                      </button>
                    </div>
                  ))}
                  
                  {(existingImages.length + previews.length) < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all duration-200 group"
                      title="Upload Images"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-indigo-500 mb-1" />
                      <span className="text-xs text-gray-500 group-hover:text-indigo-600">Add</span>
                    </button>
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500 mt-2">
                Maximum 5 images total (JPG, PNG, WebP)
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-4 sm:p-6 lg:p-8 pt-0">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 sm:h-14 text-sm sm:text-base"
            >
              Update Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default ChangeProjectSidePanel; 
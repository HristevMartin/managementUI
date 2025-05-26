'use client';

import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { CalendarIcon, Image as ImageIcon, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useModal } from "@/context/useModal";

const EXPERTISE_OPTIONS = [
  { label: "Interior Renovations", value: "interior", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
  { label: "Wall Texturing", value: "wall-texturing", color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100" },
  { label: "Flooring Installation", value: "flooring", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" },
  { label: "Ceiling Work", value: "ceiling", color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100" },
  { label: "Room Remodeling", value: "remodeling", color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" },
];

function ProjectFormSidePanel({ onSubmitProject }: { onSubmitProject?: (data: any) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showModal } = useModal();

  const { data: session } = useSession();
  let userId = session?.user?.id;
  console.log('show me the userId', userId);

  const handleExpertiseToggle = (value: string) => {
    setExpertise(prev =>
      prev.includes(value) ? prev.filter(e => e !== value) : [...prev, value]
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length + images.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }
    const newImages = [...images, ...files];
    const newPreviews = [...previews, ...files.map(f => URL.createObjectURL(f))];
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmitProject) {
      onSubmitProject({ title, desc, expertise, date, images });
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('projectDate', date);
    formData.append('expertise', JSON.stringify(expertise));
    formData.append('userId', userId);

    console.log('project images are following', images);
    
    // Append each image file
    images.forEach((image, index) => {
      formData.append(`projectImages`, image);
    });

    // Debug FormData contents - this will show you what's actually in it
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/travel/save-project`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Project saved successfully');
        showModal('success', 'Project saved successfully');
        
        // Reset form after successful submission
        setTitle('');
        setDesc('');
        setDate('');
        setExpertise([]);
        setImages([]);
        setPreviews([]);
      } else {
        console.error('Failed to save project');
        showModal('error', 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      showModal('error', 'Error saving project');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        {/* Header with gradient background */}
        <CardHeader className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white/80" />
            </div>
            <div className="text-center">
              <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
                Add Project Details
              </CardTitle>
              <p className="text-white/90 text-xs sm:text-sm px-2">
                Capture information about your recent projects and showcase your work
              </p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Project Title and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Project Title */}
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

              {/* Date */}
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
                    className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3 h-10 sm:h-12 pr-12 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                  <CalendarIcon className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Project Specifications
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {EXPERTISE_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={`flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 h-10 sm:h-12 ${
                      expertise.includes(option.value) 
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md transform scale-105" 
                        : `${option.color} border-2 hover:shadow-md hover:transform hover:scale-102`
                    }`}
                    onClick={() => handleExpertiseToggle(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
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
                placeholder="Describe your project in detail — e.g. Full interior renovation with custom wall texturing, premium flooring installation, and modern ceiling design with integrated lighting..."
                className="resize-none rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Project Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={url} 
                      alt={`Project preview ${idx + 1}`} 
                      className="w-full h-20 sm:h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      title="Remove image"
                    >
                      <X size={12} className="sm:hidden" />
                      <X size={14} className="hidden sm:block" />
                    </button>
                  </div>
                ))}
                
                {previews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all duration-200 group"
                    title="Upload Images"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 group-hover:text-indigo-600">Upload</span>
                  </button>
                )}
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
                Add up to 5 photos to showcase your work (JPG, PNG, WebP)
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-4 sm:p-6 lg:p-8 pt-0">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 sm:h-14 text-sm sm:text-base"
            >
              Save Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default ProjectFormSidePanel;
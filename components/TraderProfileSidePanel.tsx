'use client';

import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, PaintRoller, Construction, Camera, User } from "lucide-react";
import { Textarea } from "./ui/text-area";
import { useSession } from "next-auth/react";
import { useModal } from "@/context/useModal";

const TRADE_OPTIONS = [
  { label: "Electrical Work", value: "electrical", icon: <Wrench className="mr-2 text-yellow-500" />, color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100" },
  { label: "Mechanical Services", value: "mechanical", icon: <Construction className="mr-2 text-blue-500" />, color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
  { label: "Building & Construction", value: "building", icon: <PaintRoller className="mr-2 text-purple-500" />, color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100" },
  // { label: "Plumbing", value: "plumbing", icon: <Wrench className="mr-2 text-rose-500" />, color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" },
  // { label: "Other", value: "other", icon: <Construction className="mr-2 text-gray-500" />, color: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100" },
];

function TraderProfileSidePanel() {
  const [selectedTrade, setSelectedTrade] = useState<string>(""); // Changed to single selection
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showModal } = useModal();


  const { data: session } = useSession();
  let userId = (session?.user as any)?.id;
  console.log('show me the userId', userId);

  const handleTradeClick = (value: string) => {
    console.log('show me the value', value);
    setSelectedTrade(value); 
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('company', company);
    formData.append('city', city);
    formData.append('bio', bio);
    formData.append('yearsExperience', yearsExp);
    formData.append('specialties', specialties);
    formData.append('selectedTrade', selectedTrade);
    formData.append('userId', userId);

    console.log('profileImage is following', profileImage);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    // Debug FormData contents - this will show you what's actually in it
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/travel/save-profile`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Profile saved successfully');
        showModal('success', 'Profile saved successfully');
        setFullName("");
        setCompany("");
        setCity("");
        setBio("");
        setYearsExp("");
        setSpecialties("");
        setSelectedTrade("");
        setProfileImage(null);
      } else {
        console.error('Failed to save profile');
        showModal('error', 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showModal('error', 'Error saving profile');
    }
  };


  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        {/* Header with gradient background */}
        <CardHeader className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            {/* Profile Image Upload */}
            <div className="relative group">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:border-white/50"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Profile Picture"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile Preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/70 mb-1" />
                    <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/50" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: -1 }}
              />
            </div>
            <p className="text-white/80 text-xs sm:text-sm mt-2 text-center">Click to upload profile photo</p>
            <div className="text-center">
              <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
                Create Your Trader Profile
              </CardTitle>
              <p className="text-white/90 text-xs sm:text-sm px-2">
                Showcase your expertise and connect with potential clients
              </p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Trade selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Specialized Trades
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRADE_OPTIONS.map((trade) => (
                  <Button
                    key={trade.value}
                    type="button"
                    variant="outline"
                    className={`flex items-center justify-start px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${selectedTrade === trade.value
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md transform scale-105"
                      : `${trade.color} border-2 hover:shadow-md hover:transform hover:scale-102`
                      }`}
                    onClick={() => handleTradeClick(trade.value)}
                  >
                    {trade.icon}
                    {trade.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Form fields with improved styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nasko Yanev"
                  className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3"
                  required
                />
              </div>

              {/* Company details */}
              <div className="space-y-2">
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700">
                  Company
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                  className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                  City *
                </label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London"
                  className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3"
                  required
                />
              </div>

              {/* Years of experience */}
              <div className="space-y-2">
                <label htmlFor="yearsExp" className="block text-sm font-semibold text-gray-700">
                  Years of Experience *
                </label>
                <Input
                  id="yearsExp"
                  type="number"
                  min={0}
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  placeholder="e.g. 12"
                  className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialties */}
              <div className="space-y-2">
                <label htmlFor="specialties" className="block text-sm font-semibold text-gray-700">
                  Specialties
                </label>
                <Input
                  id="specialties"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Wall Texturing, Flooring, etc."
                  className="rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200 py-3"
                />
              </div>
            </div>

            {/* Bio/Description */}
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
                Profile Description
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients about your professional background, specialties, and approach to your work..."
                rows={4}
                className="resize-none rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors duration-200"
              />
            </div>
          </CardContent>

          <CardFooter className="p-8 pt-0">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Save Profile
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default TraderProfileSidePanel;
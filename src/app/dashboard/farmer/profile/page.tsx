"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  User, 
  Wheat, 
  Settings, 
  Bell, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Crop, 
  Save, 
  Upload,
  Camera
} from "lucide-react";

// Extended profile type to include additional fields
interface ExtendedProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: "farmer" | "buyer" | "admin";
  created_at: string;
  updated_at: string;
  // Additional fields
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  farm_name?: string;
  farm_size?: string;
  farm_type?: string;
  crops?: string;
  farm_location?: string;
  farm_established?: string;
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export default function FarmerProfilePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    
    // Farm Information
    farmName: "",
    farmSize: "",
    farmType: "",
    crops: "",
    farmLocation: "",
    farmEstablished: "",
    
    // Preferences
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    
    // Account Settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock updateProfile function since it doesn't exist in the auth context
  const updateProfile = async (updatedProfile: any) => {
    // In a real application, this would call an API endpoint
    console.log("Updating profile:", updatedProfile);
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      // Split full_name into first and last name
      const nameParts = (profile as ExtendedProfile).full_name?.split(" ") || ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      setFormData({
        ...formData,
        firstName,
        lastName,
        email: profile.email || "",
        phone: (profile as ExtendedProfile).phone || "",
        location: (profile as ExtendedProfile).location || "",
        bio: (profile as ExtendedProfile).bio || "",
        avatar: (profile as ExtendedProfile).avatar || "",
        farmName: (profile as ExtendedProfile).farm_name || "",
        farmSize: (profile as ExtendedProfile).farm_size || "",
        farmType: (profile as ExtendedProfile).farm_type || "",
        crops: (profile as ExtendedProfile).crops || "",
        farmLocation: (profile as ExtendedProfile).farm_location || "",
        farmEstablished: (profile as ExtendedProfile).farm_established || "",
        language: (profile as ExtendedProfile).language || "en",
        timezone: (profile as ExtendedProfile).timezone || "UTC",
        notifications: (profile as ExtendedProfile).notifications || {
          email: true,
          push: true,
          sms: false,
        },
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [name]: checked,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare profile data for update
      const updatedProfile = {
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        avatar: formData.avatar,
        farm_name: formData.farmName,
        farm_size: formData.farmSize,
        farm_type: formData.farmType,
        crops: formData.crops,
        farm_location: formData.farmLocation,
        farm_established: formData.farmEstablished,
        language: formData.language,
        timezone: formData.timezone,
        notifications: formData.notifications,
      };
      
      // Call the update profile function
      await updateProfile(updatedProfile);
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would call your API to change the password
      // For now, we'll just simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real application, you would upload the file to a server
    // and get back a URL. For now, we'll create a local URL.
    const imageUrl = URL.createObjectURL(file);
    
    setFormData({
      ...formData,
      avatar: imageUrl,
    });
  };

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar} alt="Profile" />
                    <AvatarFallback>
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
              <CardTitle className="text-xl">
                {formData.firstName} {formData.lastName}
              </CardTitle>
              <CardDescription>{formData.farmName || "Farmer"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{formData.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{formData.phone || "No phone number"}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{formData.location || "No location"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="w-full md:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information, farm details, and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="personal" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="farm" className="flex items-center">
                    <Wheat className="h-4 w-4 mr-2" />
                    Farm
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleSelectChange("language", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Farm Information Tab */}
                <TabsContent value="farm">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input
                          id="farmName"
                          name="farmName"
                          value={formData.farmName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmSize">Farm Size (acres/hectares)</Label>
                        <Input
                          id="farmSize"
                          name="farmSize"
                          value={formData.farmSize}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmType">Farm Type</Label>
                        <Select
                          value={formData.farmType}
                          onValueChange={(value) => handleSelectChange("farmType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select farm type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="arable">Arable</SelectItem>
                            <SelectItem value="horticulture">Horticulture</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                            <SelectItem value="livestock">Livestock</SelectItem>
                            <SelectItem value="organic">Organic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmEstablished">Established Year</Label>
                        <Input
                          id="farmEstablished"
                          name="farmEstablished"
                          value={formData.farmEstablished}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Farm Location</Label>
                        <Input
                          id="farmLocation"
                          name="farmLocation"
                          value={formData.farmLocation}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={formData.timezone}
                          onValueChange={(value) => handleSelectChange("timezone", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern Time</SelectItem>
                            <SelectItem value="CST">Central Time</SelectItem>
                            <SelectItem value="MST">Mountain Time</SelectItem>
                            <SelectItem value="PST">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="crops">Crops Grown (comma separated)</Label>
                        <Input
                          id="crops"
                          name="crops"
                          value={formData.crops}
                          onChange={handleInputChange}
                          placeholder="e.g., Wheat, Corn, Soybeans"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-gray-500">
                                Receive updates and alerts via email
                              </p>
                            </div>
                            <Switch
                              checked={formData.notifications.email}
                              onCheckedChange={(checked: boolean) => handleSwitchChange("email", checked)}
                            />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-gray-500">
                                Receive push notifications in the app
                              </p>
                            </div>
                            <Switch
                              checked={formData.notifications.push}
                              onCheckedChange={(checked: boolean) => handleSwitchChange("push", checked)}
                            />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>SMS Notifications</Label>
                              <p className="text-sm text-gray-500">
                                Receive important alerts via SMS
                              </p>
                            </div>
                            <Switch
                              checked={formData.notifications.sms}
                              onCheckedChange={(checked: boolean) => handleSwitchChange("sms", checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Account Settings Tab */}
                <TabsContent value="account">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <form onSubmit={handlePasswordChange}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Changing..." : "Change Password"}
                          </Button>
                        </div>
                      </form>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Account Type</Label>
                            <p className="text-sm text-gray-500">Farmer</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Member Since</Label>
                            <p className="text-sm text-gray-500">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Subscription Plan</Label>
                            <p className="text-sm text-gray-500">Free</p>
                          </div>
                          <Button variant="outline" onClick={() => router.push("/pricing")}>
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

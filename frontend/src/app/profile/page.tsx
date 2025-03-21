"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, UserProfile, UserProfileUpdate } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/userAuthRedirect";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Utility function to ensure preferences have required defaults
function safePreferences(prefs?: UserProfile["preferences"]) {
    return {
        theme: prefs?.theme ?? "dark",
        default_view: prefs?.default_view ?? "dashboard",
        notifications_enabled: prefs?.notifications_enabled ?? true,
    };
}

export default function ProfilePage() {
    const isAuthenticated = useAuthRedirect();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from API
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchProfile = async () => {
            try {
                const data = await api.auth.getProfile();
                setProfile({
                    ...data,
                    preferences: safePreferences(data.preferences),
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    // Handle profile update submission
    const handleUpdate = async () => {
        if (!profile) return;
        setUpdating(true);

        const updateData: UserProfileUpdate = {
            name: profile.name,
            preferences: safePreferences(profile.preferences),
        };

        try {
            const updatedProfile = await api.auth.updateProfile(updateData);
            setProfile({
                ...updatedProfile,
                preferences: safePreferences(updatedProfile.preferences),
            });
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Failed to update profile.");
        } finally {
            setUpdating(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action is irreversible!")) return;
        try {
            await api.auth.deleteProfile(true);
            toast.success("Account deleted. Redirecting...");
            router.push("/");
        } catch (err) {
            console.error("Error deleting account:", err);
            toast.error("Failed to delete account.");
        }
    };

    if (isAuthenticated === null || loading) {
        return <p className="text-center">Loading profile...</p>;
    }

    if (!profile) {
        return <p className="text-center text-red-500">{error || "Profile not found."}</p>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <Input type="email" value={profile.email} disabled className="bg-black" />
                    </div>

                    {/* Name (Editable) */}
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <Input
                            type="text"
                            value={profile.name || ""}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : prev)}
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Theme Selection */}
                    <div>
                        <label className="block text-sm font-medium">Theme</label>
                        <Select
                            value={safePreferences(profile.preferences).theme}
                            onValueChange={(value) =>
                                setProfile(prev => prev ? {
                                    ...prev,
                                    preferences: { ...safePreferences(prev.preferences), theme: value as "light" | "dark" }
                                } : prev)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Default View Selection */}
                    <div>
                        <label className="block text-sm font-medium">Default View</label>
                        <Select
                            value={safePreferences(profile.preferences).default_view}
                            onValueChange={(value) =>
                                setProfile(prev => prev ? {
                                    ...prev,
                                    preferences: { ...safePreferences(prev.preferences), default_view: value }
                                } : prev)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select default view" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dashboard">Dashboard</SelectItem>
                                <SelectItem value="portfolio">Portfolio</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notification Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Enable Notifications</label>
                        <Switch
                            checked={safePreferences(profile.preferences).notifications_enabled}
                            onCheckedChange={(value) =>
                                setProfile(prev => prev ? {
                                    ...prev,
                                    preferences: { ...safePreferences(prev.preferences), notifications_enabled: value }
                                } : prev)
                            }
                        />
                    </div>
                </CardContent>

                {/* Update & Delete Buttons */}
                <CardFooter className="flex justify-between">
                    <Button onClick={handleUpdate} disabled={updating}>
                        {updating ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

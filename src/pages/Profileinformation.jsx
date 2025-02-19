import React, { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { getUserUsername, updateUserInfo } from "@/services/apiRequest";
import toast from "react-hot-toast";

const ProfileInformation = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    licenseNumber: "",
    workSchedule: "",
    avatar: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [dataUser, setDataUser] = useState({});

  const userRole = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");

  const inputRef = useRef(null);
  const [image, setImage] = useState("");

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(event.target.files[0]);
  };

  useEffect(() => {
    const fetchUserData = async (username) => {
      const results = await getUserUsername(username);
      setDataUser(results);

      setUserInfo({
        ...results,
        avatar: results.avatar || null,
      });
    };
    fetchUserData(username);
  }, [username]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRole === "driver") {
      const requiredFields = [
        "phoneNumber",
        "licenseNumber",
        "workSchedule",
        "email",
      ];
      const emptyFields = requiredFields.filter((field) => !userInfo[field]);

      if (emptyFields.length > 0) {
        setError("Please fill in all required fields");
        return;
      }
    }

    try {
      await updateUserInfo(dataUser.driverId, userInfo);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar Section */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div onClick={handleImageClick}>
                {image ? (
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                    <img src={URL.createObjectURL(image)} alt="" />
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                    {userInfo.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={inputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Change
                </Button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <Input
                  name="firstName"
                  value={userInfo.firstName}
                  disabled={true}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  value={userInfo.lastName}
                  disabled={true}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={userInfo.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License Number *
                </label>
                <Input
                  type="text"
                  name="licenseNumber"
                  value={userInfo.licenseNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Work schedule*
                </label>
                <Input
                  type="date"
                  name="workSchedule"
                  value={userInfo.workSchedule}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div> */}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInformation;

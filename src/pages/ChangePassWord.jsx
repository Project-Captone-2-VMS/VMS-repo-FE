import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { changePassword } from "@/services/apiRequest";
import { Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';  // Import toast

export default function ChangePassWord() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const username = localStorage.getItem("username");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword === oldPassword) {
      setError("New password cannot be the same as the old password.");
      toast.error("New password cannot be the same as the old password.");  // Show error toast
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      toast.error("New password and confirm password do not match.");  // Show error toast
      return;
    }

    const passwords = {
      oldPassword: oldPassword,
      newPassword: newPassword,
    };

    try {
      await changePassword(username, passwords);
      toast.success("Password changed successfully!");  // Show success toast
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    } catch (error) {
      setError("Failed to change password.");
      toast.error("Failed to change password.");  // Show error toast
    }
  };

  useEffect(() => {
    // Tải dữ liệu người dùng nếu cần thiết
  }, [username]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Current Password Input */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showOldPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* New Password Input */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}
          <div>
            <Button type="submit" className="w-full">
              Change Password
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
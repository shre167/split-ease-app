import {
  User,
  Settings,
  Shield,
  Edit3,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile, updateEmail, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BottomNavigation from "@/components/BottomNavigation";
import { useCurrency } from "@/contexts/CurrencyContext";

const Profile = () => {
  const { currency, setCurrency } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  // Mock user statistics (in a real app, these would come from your database)
  const userStats = {
    totalGroups: 3,
    totalExpenses: 24,
    totalSettlements: 8,
    memberSince: "2024"
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true }); // redirect to Index.tsx
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const ChangePasswordForm = ({ user }: { user: any }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
      setError('');
      setSuccess('');

      if (!newPassword || !confirmPassword) return setError("Please fill all fields");
      if (newPassword !== confirmPassword) return setError("Passwords do not match");
      if (newPassword.length < 6) return setError("Password must be at least 6 characters");

      try {
        setLoading(true);

        if (user?.providerData?.[0]?.providerId === "password") {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
        }

        await updatePassword(user, newPassword);
        setSuccess("Password updated successfully");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err: any) {
        setError(err.code === "auth/wrong-password" ? "Incorrect current password" : err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4">
        {user?.providerData?.[0]?.providerId === "password" && (
          <div>
            <label className="block mb-1 text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block mb-1 text-sm font-medium">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Confirm Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <Button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    );
  };

  const AccountDetailsForm = ({ user }: { user: any }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);

    const handleUpdateProfile = async () => {
      setError('');
      setSuccess('');
      setLoading(true);

      try {
        // Update display name
        if (displayName !== user?.displayName) {
          await updateProfile(user, { displayName });
        }

        // Update email if changed
        if (email !== user?.email) {
          await updateEmail(user, email);
          setEmailVerificationSent(true);
        }

        setSuccess("Profile updated successfully");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleSendEmailVerification = async () => {
      try {
        await sendEmailVerification(user);
        setEmailVerificationSent(true);
        setSuccess("Email verification sent!");
      } catch (err: any) {
        setError(err.message);
      }
    };

    const handleSendPhoneVerification = async () => {
      try {
        // This would typically involve a phone verification service
        setPhoneVerificationSent(true);
        setSuccess("Phone verification code sent!");
      } catch (err: any) {
        setError(err.message);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Full Name</label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Email Address</label>
          <div className="flex space-x-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1"
            />
            {!user?.emailVerified && (
              <Button
                onClick={handleSendEmailVerification}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Verify
              </Button>
            )}
          </div>
          {!user?.emailVerified && (
            <p className="text-orange-600 text-xs mt-1">Email not verified</p>
          )}
          {user?.emailVerified && (
            <p className="text-green-600 text-xs mt-1">✓ Email verified</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Phone Number</label>
          <div className="flex space-x-2">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="flex-1"
            />
            {phoneNumber && !user?.phoneNumber && (
              <Button
                onClick={handleSendPhoneVerification}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Verify
              </Button>
            )}
          </div>
          {user?.phoneNumber && (
            <p className="text-green-600 text-xs mt-1">✓ Phone verified</p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <Button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700"
        >
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    );
  };

  const profileOptions = [
    {
      id: "account-details",
      title: "Account Details",
      description: "Manage your personal information",
      icon: User,
      content: <AccountDetailsForm user={user} />,
    },
    {
      id: "account-settings",
      title: "Account Settings",
      description: "Change password securely",
      icon: Settings,
      content: <ChangePasswordForm user={user} />,
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Customize currency and time zone",
      icon: Edit3,
      content: (
        <div className="space-y-4">
          <label>
            Currency:
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "INR" | "USD" | "EUR")}
              className="w-full border p-2 mt-1 rounded"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </label>
          <label>
            Language:
            <select className="w-full border p-2 mt-1 rounded">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </label>
          <label>
            Timezone:
            <select className="w-full border p-2 mt-1 rounded">
              <option>IST (GMT+5:30)</option>
              <option>UTC</option>
            </select>
          </label>
        </div>
      ),
    },
    {
      id: "privacy-settings",
      title: "Privacy Settings",
      description: "Who can add you to groups",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <label>
            <input type="checkbox" className="mr-2" />
            Allow friends to add me to groups
          </label>
          <label>
            <input type="checkbox" className="mr-2" />
            Show my profile to other users
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.photoURL || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-violet-600 text-white text-xl font-semibold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {user?.displayName || "User"}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Member since {userStats.memberSince}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            📈 Your Activity
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalGroups}</div>
              <div className="text-xs text-gray-600">Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.totalExpenses}</div>
              <div className="text-xs text-gray-600">Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.totalSettlements}</div>
              <div className="text-xs text-gray-600">Settlements</div>
            </div>
          </div>
          
        </div>

      </div>

      {/* Profile Options */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {profileOptions.map((option) => (
            <Dialog key={option.id}>
              <DialogTrigger asChild>
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                      <option.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{option.title}</DialogTitle>
                </DialogHeader>
                {option.content}
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;

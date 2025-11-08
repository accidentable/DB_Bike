import { useState, useEffect } from "react";
import { User, Award, MapPin, Calendar, Trophy, Medal, Star, Target, Bike, TrendingUp, Edit, Lock } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/layout/Header";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getCurrentUser, updateProfile, changePassword } from "../api/client";

interface ProfilePageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onRankingClick: () => void;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

const achievements: Achievement[] = [
  {
    id: 1,
    name: "Ï≤?Í±∏Ïùå",
    description: "Ï≤??∞Î¶â???¥Ïö© ?ÑÎ£å",
    icon: "?ö¥",
    earned: true,
  },
  {
    id: 2,
    name: "Ï∂úÌá¥Í∑?ÎßàÏä§??,
    description: "10???∞ÏÜç ?¥Ïö©",
    icon: "?èÜ",
    earned: true,
  },
  {
    id: 3,
    name: "?•Í±∞Î¶??ºÏù¥??,
    description: "?ÑÏ†Å 100km ?¨ÏÑ±",
    icon: "?éØ",
    earned: true,
  },
  {
    id: 4,
    name: "?òÍ≤Ω ÏßÄ?¥Ïù¥",
    description: "?ÑÏ†Å 500km ?¨ÏÑ±",
    icon: "?åø",
    earned: false,
    progress: 287,
    total: 500,
  },
  {
    id: 5,
    name: "?ÑÍµ≠Íµ?,
    description: "50Í∞??¥ÏÉÅ???Ä?¨ÏÜå ?¥Ïö©",
    icon: "?ó∫Ô∏?,
    earned: false,
    progress: 32,
    total: 50,
  },
  {
    id: 6,
    name: "?®Í≥® ?åÏõê",
    description: "100???¥Ïö© ?¨ÏÑ±",
    icon: "‚≠?,
    earned: false,
    progress: 67,
    total: 100,
  },
];

export function ProfilePage({ 
  onClose, 
  onLoginClick, 
  onSignupClick, 
  onStationFinderClick, 
  onNoticeClick, 
  onCommunityClick, 
  onPurchaseClick, 
  onFaqClick, 
  onHomeClick,
  onRankingClick 
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"info" | "achievements">("info");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ?¨Ïö©???∞Ïù¥???ÅÌÉú
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    memberSince: "",
    totalDistance: 0,
    totalRides: 0,
    rank: 0,
    currentTicket: "?ïÍ∏∞Í∂?(30??",
    ticketExpiry: "2025-11-28",
  });

  // ?òÏ†ï ???∞Ïù¥??
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    studentId: "",
  });

  // ÎπÑÎ?Î≤àÌò∏ Î≥ÄÍ≤???
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ?¨Ïö©???ïÎ≥¥ Î°úÎìú
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        studentId: user.studentId || "",
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
        totalDistance: user.totalDistance || 0,
        totalRides: user.totalRides || 0,
        rank: 142,
        currentTicket: "?ïÍ∏∞Í∂?(30??",
        ticketExpiry: "2025-11-28",
      });
      setEditForm({
        name: user.name,
        phone: user.phone || "",
        studentId: user.studentId || "",
      });
    }
  }, []);

  // ?ïÎ≥¥ ?òÏ†ï ?∏Îì§??
  const handleEditProfile = async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await updateProfile(editForm);
      if (result.success && result.user) {
        setUserData(prev => ({
          ...prev,
          name: result.user!.name,
          phone: result.user!.phone,
          studentId: result.user!.studentId,
        }));
        alert("?ÑÎ°ú?ÑÏù¥ ?ÖÎç∞?¥Ìä∏?òÏóà?µÎãà??");
        setIsEditDialogOpen(false);
        window.dispatchEvent(new Event('loginStatusChanged'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ÎπÑÎ?Î≤àÌò∏ Î≥ÄÍ≤??∏Îì§??
  const handleChangePassword = async () => {
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("??ÎπÑÎ?Î≤àÌò∏Í∞Ä ?ºÏπò?òÏ? ?äÏäµ?àÎã§.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        alert("ÎπÑÎ?Î≤àÌò∏Í∞Ä Î≥ÄÍ≤ΩÎêò?àÏäµ?àÎã§.");
        setIsPasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "?ÑÏ†Å Í±∞Î¶¨",
      value: `${userData.totalDistance}km`,
      icon: <MapPin className="w-5 h-5 text-[#00A862]" />,
      description: "?ÑÏÜå Î∞∞Ï∂ú ?àÍ∞ê ??57.5kg"
    },
    {
      label: "?¥Ïö© ?üÏàò",
      value: `${userData.totalRides}??,
      icon: <Bike className="w-5 h-5 text-[#00A862]" />,
      description: "?âÍ∑† ?¥Ïö© ?úÍ∞Ñ 25Î∂?
    },
    {
      label: "?ÑÏ≤¥ ??Çπ",
      value: `${userData.rank}??,
      icon: <Trophy className="w-5 h-5 text-[#00A862]" />,
      description: "?ÅÏúÑ 5%"
    },
    {
      label: "?çÎìù ?ÖÏ†Å",
      value: `${achievements.filter(a => a.earned).length}/${achievements.length}`,
      icon: <Award className="w-5 h-5 text-[#00A862]" />,
      description: "?¨ÏÑ±Î•?50%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
        onProfileClick={onClose}
        onRankingClick={onRankingClick}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-[#00A862] rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2">{userData.name}</h1>
                <p className="text-gray-600 mb-1">{userData.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-[#00A862]">
                    {userData.currentTicket}
                  </Badge>
                  <Badge variant="outline">
                    Í∞Ä?ÖÏùº: {userData.memberSince}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  ?ïÎ≥¥ ?òÏ†ï
                </Button>
                <Button
                  variant="outline"
                  className="border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white"
                  onClick={onRankingClick}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  ??Çπ Î≥¥Í∏∞
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {stat.icon}
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <div className="mb-1">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 transition-colors ${
              activeTab === "info"
                ? "border-b-2 border-[#00A862] text-[#00A862]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Í∏∞Î≥∏ ?ïÎ≥¥
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-6 py-3 transition-colors ${
              activeTab === "achievements"
                ? "border-b-2 border-[#00A862] text-[#00A862]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ?ÖÏ†Å
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" ? (
          <div className="max-w-2xl">
            <Card className="p-6">
              <h2 className="mb-6">Í∏∞Î≥∏ ?ïÎ≥¥</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">?¥Î¶Ñ</span>
                  <span className="col-span-2">{userData.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">?¥Î©î??/span>
                  <span className="col-span-2">{userData.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">?ÑÌôîÎ≤àÌò∏</span>
                  <span className="col-span-2">{userData.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">Í∞Ä?ÖÏùº</span>
                  <span className="col-span-2">{userData.memberSince}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">?ÑÏû¨ ?¥Ïö©Í∂?/span>
                  <span className="col-span-2">{userData.currentTicket}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <span className="text-gray-600">?¥Ïö©Í∂?ÎßåÎ£å??/span>
                  <span className="col-span-2">{userData.ticketExpiry}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <Button className="bg-[#00A862] hover:bg-[#008F54] mr-3">
                  ?ïÎ≥¥ ?òÏ†ï
                </Button>
                <Button variant="outline">
                  ÎπÑÎ?Î≤àÌò∏ Î≥ÄÍ≤?
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="mb-2">?ÖÏ†Å ({achievements.filter(a => a.earned).length}/{achievements.length})</h2>
              <p className="text-gray-600">?∞Î¶â?¥Î? ?¥Ïö©?òÎ©∞ ?§Ïñë???ÖÏ†Å???¨ÏÑ±?¥Î≥¥?∏Ïöî!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`p-6 ${achievement.earned ? 'bg-gradient-to-br from-[#00A862]/10 to-white' : 'opacity-75'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.earned ? (
                        <Badge className="bg-[#00A862]">
                          <Star className="w-3 h-3 mr-1" />
                          ?¨ÏÑ± ?ÑÎ£å
                        </Badge>
                      ) : achievement.progress !== undefined ? (
                        <div>
                          <div className="flex items-center justify-between mb-1 text-sm text-gray-600">
                            <span>{achievement.progress} / {achievement.total}</span>
                            <span>{Math.round((achievement.progress! / achievement.total!) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.total!) * 100} 
                            className="h-2"
                          />
                        </div>
                      ) : (
                        <Badge variant="outline">
                          ?†Í?
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Í∏∞Î≥∏ ?ïÎ≥¥ ??*/}
        {activeTab === "info" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>Í∏∞Î≥∏ ?ïÎ≥¥</h3>
                <Button
                  variant="outline"
                  className="border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  ÎπÑÎ?Î≤àÌò∏ Î≥ÄÍ≤?
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">?¥Î¶Ñ</span>
                    <p className="text-lg">{userData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">?¥Î©î??/span>
                    <p className="text-lg">{userData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">?ÑÌôîÎ≤àÌò∏</span>
                    <p className="text-lg">{userData.phone || "ÎØ∏Îì±Î°?}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">?ôÎ≤à</span>
                    <p className="text-lg">{userData.studentId || "ÎØ∏Îì±Î°?}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ?ïÎ≥¥ ?òÏ†ï ?§Ïù¥?ºÎ°úÍ∑?*/}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>?ÑÎ°ú???ïÎ≥¥ ?òÏ†ï</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">?¥Î¶Ñ</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">?ÑÌôîÎ≤àÌò∏</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-student-id">?ôÎ≤à</Label>
              <Input
                id="edit-student-id"
                value={editForm.studentId}
                onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEditProfile}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                disabled={isLoading}
              >
                {isLoading ? "?Ä??Ï§?.." : "?Ä??}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Ï∑®ÏÜå
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ÎπÑÎ?Î≤àÌò∏ Î≥ÄÍ≤??§Ïù¥?ºÎ°úÍ∑?*/}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ÎπÑÎ?Î≤àÌò∏ Î≥ÄÍ≤?/DialogTitle>
          </DialogHeader>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">?ÑÏû¨ ÎπÑÎ?Î≤àÌò∏</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-password">??ÎπÑÎ?Î≤àÌò∏</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">??ÎπÑÎ?Î≤àÌò∏ ?ïÏù∏</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleChangePassword}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                disabled={isLoading}
              >
                {isLoading ? "Î≥ÄÍ≤?Ï§?.." : "Î≥ÄÍ≤?}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                disabled={isLoading}
              >
                Ï∑®ÏÜå
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

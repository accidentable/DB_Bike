import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Header } from "../components/layout/Header";
import { Mail, Lock, User, Phone, Check, AlertCircle } from "lucide-react";
import { signup } from "../api/client";

interface SignupPageProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
}

export function SignupPage({ onClose, onSwitchToLogin, onStationFinderClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick, onProfileClick, onRankingClick }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAllAgreements = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [key]: checked,
    };
    
    if (key !== "all") {
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
    }
    
    setAgreements(newAgreements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    
    if (formData.password !== formData.confirmPassword) {
      setError("비�?번호가 ?�치?��? ?�습?�다.");
      return;
    }
    
    if (!agreements.terms || !agreements.privacy) {
      setError("?�수 ?��????�의?�주?�요.");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        studentId: formData.studentId,
      });

      if (result.success) {
        alert("?�원가?�이 ?�료?�었?�니?? 로그?�해주세??");
        onSwitchToLogin();
      }
    } catch (err: any) {
      setError(err.message || "?�원가?�에 ?�패?�습?�다.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = async (email: string) => {
    if (!email) {
      setValidationErrors(prev => ({ ...prev, email: "?�메?�을 ?�력?�주?�요." }));
      return false;
    }
    const result = await checkEmailAvailability(email);
    if (!result.available) {
      setValidationErrors(prev => ({ ...prev, email: "?��? ?�용 중인 ?�메?�입?�다." }));
      return false;
    }
    return true;
  };

  const validateName = (name: string) => {
    if (!name) {
      setValidationErrors(prev => ({ ...prev, name: "?�름???�력?�주?�요." }));
      return false;
    }
    return true;
  };

  const validatePhone = (phone: string) => {
    if (!phone) {
      setValidationErrors(prev => ({ ...prev, phone: "?��???번호�??�력?�주?�요." }));
      return false;
    }
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setValidationErrors(prev => ({ ...prev, password: "비�?번호�??�력?�주?�요." }));
      return false;
    }
    if (password.length < 8) {
      setValidationErrors(prev => ({ ...prev, password: "비�?번호??8???�상?�어???�니??" }));
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "비�?번호�??�시 ?�력?�주?�요." }));
      return false;
    }
    return true;
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        await validateEmail(value);
        break;
      case "name":
        validateName(value);
        break;
      case "phone":
        validatePhone(value);
        break;
      case "password":
        validatePassword(value);
        break;
      case "confirmPassword":
        validateConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onSwitchToLogin}
        onSignupClick={onClose}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
      />
      <div className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00A862] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">?��</span>
            </div>
            <h2 className="mb-2">?�원가??/h2>
            <p className="text-gray-600 text-sm">
              ?�릉?��? ?�께 건강???�울 ?�활???�작?�세??
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">?�름</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="?�길??
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10"
                  required
                />
                {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">?�메??/Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10"
                  required
                />
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">?��???번호</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10"
                />
                {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="studentId">?�번 (?�택)</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="2024123456"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">비�?번호</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="8???�상 ?�력?�세??
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10"
                  minLength={8}
                  required
                />
                {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">비�?번호 ?�인</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비�?번호�??�시 ?�력?�세??
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10"
                  minLength={8}
                  required
                />
                {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="all"
                    checked={agreements.all}
                    onCheckedChange={(checked) => handleAllAgreements(checked as boolean)}
                  />
                  <Label htmlFor="all" className="cursor-pointer">
                    ?�체 ?�의
                  </Label>
                </div>

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={(checked) => handleAgreementChange("terms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      ?�용?��? ?�의 <span className="text-red-500">(?�수)</span>
                    </Label>
                  </div>
                  <a href="#" className="text-xs text-gray-500 underline">
                    보기
                  </a>
                </div>

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacy}
                      onCheckedChange={(checked) => handleAgreementChange("privacy", checked as boolean)}
                    />
                    <Label htmlFor="privacy" className="text-sm cursor-pointer">
                      개인?�보 ?�집 �??�용 ?�의 <span className="text-red-500">(?�수)</span>
                    </Label>
                  </div>
                  <a href="#" className="text-xs text-gray-500 underline">
                    보기
                  </a>
                </div>

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="marketing"
                      checked={agreements.marketing}
                      onCheckedChange={(checked) => handleAgreementChange("marketing", checked as boolean)}
                    />
                    <Label htmlFor="marketing" className="text-sm cursor-pointer">
                      마�????�보 ?�신 ?�의 (?�택)
                    </Label>
                  </div>
                  <a href="#" className="text-xs text-gray-500 underline">
                    보기
                  </a>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#00A862] hover:bg-[#008F54] mt-6">
              ?�원가??
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">?��? 계정???�으?��??? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-[#00A862] hover:underline"
            >
              로그??
            </button>
          </div>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="mb-1">?�원가?????�음 ?�택??받으?????�습?�다:</p>
              <ul className="text-xs space-y-1 text-blue-800">
                <li>???�울???�역 2,500�??�상 ?�?�소 ?�용</li>
                <li>??모바???�에??QR ?�캔?�로 간편 ?�??/li>
                <li>???�용 ?�역 �?결제 관�?/li>
                <li>???�기�??�인 ?�택</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

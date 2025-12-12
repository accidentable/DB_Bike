/**
 * src/pages/ContactPage.tsx
 * 문의하기 페이지
 * 
 * 사용된 API:
 * (현재 API 미사용 - 추후 구현 예정)
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const navigate = useNavigate();
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEmailForm(prev => ({ ...prev, [id]: value }));
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제 API 호출 로직 (추후 구현)
    console.log("문의 내용:", emailForm);

    setTimeout(() => {
      alert("문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
      setIsSubmitting(false);
      navigate('/faq'); // 제출 후 FAQ 페이지로 돌아가기
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>

        <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">이메일 문의</CardTitle>
        </CardHeader>
        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="이름을 입력하세요" value={emailForm.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="답변받을 이메일을 입력하세요" value={emailForm.email} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">제목</Label>
              <Input id="subject" placeholder="문의 제목을 입력하세요" value={emailForm.subject} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">문의 내용</Label>
              <Textarea id="message" placeholder="문의하실 내용을 자세하게 입력해주세요" className="min-h-[150px]" value={emailForm.message} onChange={handleInputChange} required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              뒤로가기
            </Button>
            <Button type="submit" className="bg-[#00A862] hover:bg-[#007F4E]" disabled={isSubmitting}>
              {isSubmitting ? '제출 중...' : '제출하기'}
            </Button>
          </CardFooter>
        </form>
        </Card>
      </div>
    </div>
  );
}
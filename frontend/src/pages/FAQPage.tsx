import { useState } from "react";
import { Mail, MessageCircle, Send, X } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Header } from "../components/layout/Header";

interface FAQPageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
}

const faqs = [
  {
    id: 1,
    question: "따릉이는 어떻게 이용하나요?",
    answer: "따릉이 앱을 다운로드하거나 웹사이트에서 회원가입 후 이용권을 구매하시면 됩니다. 대여소에서 QR코드를 스캔하거나 자전거 번호를 입력하여 대여할 수 있습니다. 이용 후에는 가까운 대여소에 거치대에 반납하시면 됩니다."
  },
  {
    id: 2,
    question: "이용요금은 어떻게 되나요?",
    answer: "1시간권 1,000원, 1일권 2,000원, 정기권(30일) 5,000원, 연간권 30,000원입니다. 1회 이용시간은 2시간까지이며, 초과 시 5분당 200원의 추가 요금이 부과됩니다. 정기권과 연간권은 2시간 이내 반납 시 무료로 무제한 이용 가능합니다."
  },
  {
    id: 3,
    question: "자전거를 어디에나 반납할 수 있나요?",
    answer: "따릉이는 지정된 대여소에서만 반납 가능합니다. 서울 전역에 2,500개 이상의 대여소가 있으며, 앱에서 가까운 대여소를 검색할 수 있습니다. 대여소가 만석인 경우 다른 대여소를 이용해주시기 바랍니다."
  },
  {
    id: 4,
    question: "이용 중 자전거가 고장나면 어떻게 하나요?",
    answer: "이용 중 자전거 고장 발견 시 즉시 가까운 대여소에 반납하시고, 따릉이 콜센터(1599-0120)에 신고해주시기 바랍니다. 고장 신고 시 해당 이용 건은 요금이 부과되지 않으며, 다른 자전거로 재대여할 수 있습니다."
  },
  {
    id: 5,
    question: "따릉이를 타다가 사고가 났어요. 어떻게 해야 하나요?",
    answer: "먼저 안전한 곳으로 이동하시고, 부상이 있는 경우 119에 연락하세요. 경미한 사고인 경우 콜센터(1599-0120)에 연락주시면 안내드립니다. 따릉이 이용자는 공영자전거 보험에 가입되어 있으며, 사고 접수 시 보험처리가 가능합니다."
  },
  {
    id: 6,
    question: "환불은 어떻게 받나요?",
    answer: "이용권 구매 후 미사용 시 환불이 가능합니다. 1일권은 당일 내, 정기권과 연간권은 최초 이용 전까지 100% 환불됩니다. 이용 이력이 있는 경우 일할 계산하여 환불되며, 앱의 '내 정보 > 환불신청'에서 신청하실 수 있습니다."
  },
  {
    id: 7,
    question: "미성년자도 이용할 수 있나요?",
    answer: "만 15세 이상부터 이용 가능합니다. 회원가입 시 본인 인증이 필요하며, 만 15세 미만인 경우 보호자 동의가 있어야 이용하실 수 있습니다. 안전한 이용을 위해 연령 제한을 준수해주시기 바랍니다."
  },
  {
    id: 8,
    question: "따릉이 앱이 작동하지 않아요",
    answer: "앱을 최신 버전으로 업데이트 해주세요. 그래도 문제가 지속되면 앱 재설치를 시도해보세요. GPS 및 카메라 권한이 허용되어 있는지도 확인해주세요. 계속 문제가 발생하면 콜센터(1599-0120)나 1:1 상담 챗봇으로 문의해주시기 바랍니다."
  }
];

const additionalFaqs = [
  { id: 9, question: "외국인도 따릉이를 이용할 수 있나요?", category: "이용방법" },
  { id: 10, question: "전기자전거와 일반자전거의 차이는 무엇인가요?", category: "자전거" },
  { id: 11, question: "대여소를 어떻게 찾나요?", category: "대여소" },
  { id: 12, question: "자전거를 분실했거나 파손했어요", category: "사고/분실" },
  { id: 13, question: "날씨가 나쁜 날에도 이용할 수 있나요?", category: "이용방법" },
  { id: 14, question: "여러 대를 동시에 대여할 수 있나요?", category: "이용방법" },
  { id: 15, question: "이용 요금은 어디서 확인하나요?", category: "이용권/결제" },
  { id: 16, question: "따릉이 대여소를 우리 동네에도 설치할 수 있나요?", category: "대여소" },
];

export function FAQPage({ onClose, onLoginClick, onSignupClick, onStationFinderClick, onNoticeClick, onCommunityClick, onPurchaseClick, onHomeClick }: FAQPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "?�녕?�세?? ?�릉??고객?�터?�니?? 무엇???��??�릤까요?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdditionalFaqs = additionalFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages([...chatMessages, { sender: "user", text: chatInput }]);
    
    // 간단한 자동답 로직
    setTimeout(() => {
      let botResponse = "죄송합니다. 관련 정보를 찾지 못했습니다. 상담원 연결을 원하시면 콜센터(1599-0120)로 연락 주세요.";
      
      if (chatInput.includes("요금") || chatInput.includes("가격")) {
        botResponse = "따릉이 이용권은 1시간권 1,000원, 1일권 2,000원, 정기권 5,000원, 연간권 30,000원입니다. 자세한 내용은 '이용권 구매' 페이지를 참고해주세요.";
      } else if (chatInput.includes("대여") || chatInput.includes("이용")) {
        botResponse = "따릉이는 앱에서 QR코드 스캔 또는 자전거 번호 입력으로 대여할 수 있습니다. 이용 후 지정된 대여소에 반납해주시면 됩니다.";
      } else if (chatInput.includes("고장") || chatInput.includes("문제")) {
        botResponse = "자전거 고장 발견 시 가까운 대여소에 반납 후 콜센터(1599-0120)에 신고해주세요. 해당 이용 건은 요금이 부과되지 않습니다.";
      } else if (chatInput.includes("환불")) {
        botResponse = "미사용 이용권은 100% 환불 가능합니다. 앱의 '내 정보 > 환불신청'에서 신청하실 수 있습니다.";
      }
      
      setChatMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 1000);

    setChatInput("");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
    setEmailForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onClose}
        onHomeClick={onHomeClick}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">자주 묻는 질문 (FAQ)</h1>
          <p className="text-gray-600 mb-6">
            따릉이 이용에 관한 자주 묻는 질문을 확인해보세요
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="궁금한 내용을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Main FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="p-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value={`item-${faq.id}`} className="border-none">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3">
                        <span className="bg-[#00A862] text-white px-2 py-1 rounded text-sm flex-shrink-0">Q</span>
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-start gap-3 pt-4">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm flex-shrink-0">A</span>
                        <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Questions */}
        <Card className="p-8 mb-12">
          <h3 className="text-xl font-bold mb-4">더 많은 질문 항목</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredAdditionalFaqs.map((faq) => (
              <button
                key={faq.id}
                className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-xs text-[#00A862] mb-2">{faq.category}</div>
                <div className="text-sm">{faq.question}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Contact Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Email Contact Form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-[#00A862]" />
              <h3 className="text-lg font-bold">이메일로 문의하기</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              1-2 영업일 내에 답변 드리겠습니다
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">이름</label>
                <Input
                  required
                  value={emailForm.name}
                  onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">이메일</label>
                <Input
                  type="email"
                  required
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">제목</label>
                <Input
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  placeholder="문의 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">문의 내용</label>
                <Textarea
                  required
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full bg-[#00A862] hover:bg-[#008F54]">
                <Send className="w-4 h-4 mr-2" />
                문의하기
              </Button>
            </form>
          </Card>

          {/* Chatbot */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#00A862]" />
              <h3 className="text-lg font-bold">1:1 상담 챗봇</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              간단한 질문은 챗봇으로 빠르게 해결하세요
            </p>
            <Button
              onClick={() => setShowChatbot(true)}
              className="w-full bg-[#00A862] hover:bg-[#008F54]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              상담 시작하기
            </Button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-bold mb-3">전화 상담</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>콜센터:</strong> 1599-0120
              </p>
              <p className="text-sm text-gray-700">
                <strong>운영시간:</strong> 평일 09:00 - 18:00
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg h-[600px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-[#00A862] text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="text-white font-bold">따릉이 상담 챗봇</h3>
              </div>
              <button onClick={() => setShowChatbot(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-[#00A862] text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="메시지를 입력하세요..."
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#00A862] hover:bg-[#008F54]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

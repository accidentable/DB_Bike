// src/pages/FAQPage.tsx
// (모든 import 경로 수정)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate import
import { ChevronDown, ChevronUp, Mail, MessageCircle, Send, X, ArrowLeft } from "lucide-react"; // ArrowLeft 추가
import { Card } from "../components/ui/card"; // 경로 수정
import { Button } from "../components/ui/button"; // 경로 수정
import { Input } from "../components/ui/input"; // 경로 수정
import { Textarea } from "../components/ui/textarea"; // 경로 수정
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"; // 경로 수정
import Header from "../components/layout/Header"; // 경로 수정 및 default import

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

// ... (faqs, additionalFaqs 데이터는 원본과 동일하게 유지) ...
const faqs = [
  {
    id: 1,
    question: "따릉이는 어떻게 이용하나요?",
    answer: "광운따릉이 앱을 다운로드하고 회원가입 및 이용권을 구매하세요. 앱 내 지도에서 가까운 대여소를 찾아 원하는 자전거의 QR코드를 스캔하면 잠금장치가 해제되어 바로 이용할 수 있습니다. 이용 후에는 가까운 대여소에 자전거를 거치하고 잠금장치를 잠그면 자동으로 반납 처리됩니다."
  },
  {
    id: 2,
    question: "이용요금은 어떻게 되나요?",
    answer: "광운따릉이는 다양한 이용권을 제공합니다. 1시간권(1,000원), 1일권(2,000원), 30일 정기권(5,000원), 180일권(15,000원), 365일 연간권(30,000원) 등이 있습니다. 자세한 요금 정보와 이용권 구매는 앱 내 '이용권 구매' 메뉴에서 확인하실 수 있습니다. 기본 이용 시간을 초과할 경우 5분당 200원의 추가 요금이 부과됩니다."
  },
  {
    id: 3,
    question: "자전거를 어디서나 반납할 수 있나요?",
    answer: "아니요, 광운따릉이는 지정된 대여소에만 반납할 수 있습니다. 앱 내 지도를 통해 가까운 대여소 위치를 확인하고, 비어있는 거치대에 자전거를 거치한 후 잠금장치를 잠가주세요. 대여소가 아닌 곳에 반납할 경우 방치로 간주되어 추가 요금 및 페널티가 부과될 수 있습니다."
  },
  {
    id: 4,
    question: "이용 중 자전거가 고장나면 어떻게 하나요?",
    answer: "자전거에 문제가 발생했을 경우, 즉시 운행을 중단하고 가까운 대여소에 반납해주세요. 그 후, 앱의 '고장 신고' 기능을 통해 자전거 번호와 고장 내용을 신고해주시면 신속하게 조치하겠습니다. 고장 신고된 이용 건에 대해서는 요금이 부과되지 않습니다."
  },
  {
    id: 5,
    question: "따릉이를 타다가 사고가 났어요. 어떻게 해야 하나요?",
    answer: "안전이 최우선입니다. 먼저 본인의 안전을 확보하고 필요한 경우 119에 연락하세요. 이후 광운따릉이 고객센터(1599-0120)로 연락하여 사고 접수를 해주시기 바랍니다. 광운따릉이 이용자는 자전거 단체보험에 자동으로 가입되며, 사고 내용에 따라 보험 처리를 받으실 수 있습니다."
  },
  {
    id: 6,
    question: "환불은 어떻게 받나요?",
    answer: "구매 후 사용하지 않은 이용권은 전액 환불이 가능합니다. 앱 내 '마이페이지 > 이용권 내역'에서 환불 신청을 할 수 있습니다. 이용권 사용을 시작한 후에는 원칙적으로 환불이 어려우나, 시스템 오류 등 특별한 사유가 있을 경우 고객센터로 문의해주세요."
  },
  {
    id: 7,
    question: "미성년자도 이용할 수 있나요?",
    answer: "네, 만 13세 이상이라면 누구나 이용할 수 있습니다. 단, 만 19세 미만의 미성년자는 회원가입 시 보호자(법정대리인)의 동의 절차가 필요합니다. 안전한 이용을 위해 자전거 이용 안전 수칙을 반드시 숙지해주시기 바랍니다."
  },
  {
    id: 8,
    question: "따릉이 앱이 작동하지 않아요.",
    answer: "앱 사용에 불편을 드려 죄송합니다. 먼저 앱을 완전히 종료한 후 재실행해보거나, 스마트폰을 재부팅해보세요. 그래도 문제가 해결되지 않으면 앱을 삭제하고 최신 버전으로 재설치하는 것을 권장합니다. 지속적인 문제가 발생할 경우, 고객센터로 연락주시면 원인을 파악하여 해결해드리겠습니다."
  }
];

const additionalFaqs = [
  { id: 9, question: "외국인도 따릉이를 이용할 수 있나요?", category: "이용방법" },
  { id: 10, question: "전기자전거와 일반자전거의 차이는 무엇인가요?", category: "자전거" },
  { id: 11, question: "대여소는 어떻게 찾나요?", category: "대여소" },
  { id: 12, question: "자전거를 분실하거나 파손했어요.", category: "사고/분실" },
  { id: 13, question: "날씨가 나쁜 날에도 이용할 수 있나요?", category: "이용방법" },
  { id: 14, question: "여러 대를 동시에 대여할 수 있나요?", category: "이용방법" },
  { id: 15, question: "이용 내역은 어디서 확인하나요?", category: "이용권/결제" },
  { id: 16, question: "따릉이 대여소를 우리 동네에도 설치할 수 있나요?", category: "대여소" },
];

export default function FAQPage(_props: FAQPageProps = {}) {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "안녕하세요! 따릉이 고객센터입니다. 무엇을 도와드릤까요?" }
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
    // ... (챗봇 로직은 원본과 동일하게 유지) ...
    if (!chatInput.trim()) return;

    setChatMessages([...chatMessages, { sender: "user", text: chatInput }]);
    
    setTimeout(() => {
      let botResponse = "죄송합니다. 관련 정보를 찾지 못했습니다. 상담원 연결을 원하시면 콜센터(1599-0120)로 연락 주세요.";
      
      if (chatInput.includes("요금") || chatInput.includes("가격")) {
        botResponse = "따릉이 이용권은 1시간권(1,000원), 1일권(2,000원), 정기권(5,000원), 연간권(30,000원)이 있습니다. 자세한 내용은 '이용권 구매' 페이지를 참고해주세요.";
      } else if (chatInput.includes("대여") || chatInput.includes("이용")) {
        botResponse = "따릉이는 앱에서 QR코드 스캔 또는 자전거 번호 입력으로 대여하실 수 있습니다. 이용 후 지정된 대여소에 반납해주시면 됩니다.";
      } else if (chatInput.includes("고장") || chatInput.includes("문제")) {
        botResponse = "자전거 고장 발견 시 가까운 대여소에 반납 후 콜센터(1599-0120)로 신고해주세요. 해당 이용 건은 요금이 부과되지 않습니다.";
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
      {/* Header는 App.tsx에서 렌더링되므로 제거 */}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2">자주 묻는 질문 (FAQ)</h1>
          <p className="text-gray-600 mb-6">
            따릉이 이용에 대해 자주 묻는 질문을 확인해보세요
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
          <h2 className="mb-6">자주 묻는 질문</h2>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">더 많은 질문 사항</h3>
            <button
              onClick={() => navigate('/contact')} // 클릭 시 /contact 경로로 이동
              className="text-sm text-[#00A862] hover:text-[#008F54] underline"
            >
              이메일로 문의하기
            </button>
          </div>
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
        
      </div>

              {/* Chatbot Modal */}
            {/* {showChatbot && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg h-[600px] flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between bg-[#00A862] text-white rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <h3 className="text-white">따릉이 상담 챗봇</h3>
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
            )} */}    </div>
  );
}
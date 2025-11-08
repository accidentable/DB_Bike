import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "안녕하세요! 광운따릉이 상담 챗봇입니다. 무엇을 도와드릴까요?", isBot: true },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages([...messages, userMessage]);
    
    // 간단한 자동 응답
    setTimeout(() => {
      let botResponse = "궁금하신 내용에 대해 답변드리겠습니다.";
      
      if (input.includes("대여") || input.includes("이용")) {
        botResponse = "광운따릉이는 캠퍼스 내 대여소에서 24시간 이용 가능합니다. 앱에서 가까운 대여소를 찾아보세요!";
      } else if (input.includes("요금") || input.includes("가격")) {
        botResponse = "1시간 이용권 1,000원부터 다양한 요금제가 있습니다. '이용권 구매' 메뉴를 확인해주세요!";
      } else if (input.includes("반납")) {
        botResponse = "대여소의 빈 거치대에 자전거를 꽂고 잠금이 되었는지 확인해주세요. 앱에서 반납 완료를 확인할 수 있습니다.";
      }
      
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 500);

    setInput("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#00A862] text-white rounded-full shadow-lg hover:bg-[#008F54] transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96">
      <Card className="shadow-2xl border-2 border-[#00A862]">
        {/* Header */}
        <div className="bg-[#00A862] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3>상담 챗봇</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-[#008F54] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  message.isBot
                    ? "bg-white text-gray-800 border border-gray-200"
                    : "bg-[#00A862] text-white"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              className="bg-[#00A862] hover:bg-[#008F54]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

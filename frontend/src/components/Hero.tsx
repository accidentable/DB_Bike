import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { MapPin, Bike, Clock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-[#00A862] to-[#00C896] text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="mb-6">
              광운대학교의 모든 순간,
              <br />
              광운따릉이와 함께
            </h1>
            <p className="mb-8 text-lg opacity-90">
              언제 어디서나 편리하게 이용하는 광운대 공공자전거 서비스
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" className="bg-white text-[#00A862] hover:bg-green-50">
                <MapPin className="w-5 h-5 mr-2" />
                대여소 찾기
              </Button>
              <Button size="lg" className="bg-white text-[#00A862] hover:bg-green-50">
                <Bike className="w-5 h-5 mr-2" />
                이용방법 보기
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-1">50+</div>
                <div className="text-sm opacity-90">대여소</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-1">500+</div>
                <div className="text-sm opacity-90">광운따릉이</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-1">24시간</div>
                <div className="text-sm opacity-90">운영</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1565444872947-6fd5f91ee0f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYmlrZSUyMHNoYXJpbmclMjBiaWN5Y2xlfGVufDF8fHx8MTc2MjE0OTcyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="광운따릉이 자전거"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// 광운따릉이 테마 색상
export const THEME_COLORS = {
  primary: '#E63946',        // 연한 빨강 (메인 컬러)
  primaryHover: '#D62828',   // 호버 시 진한 빨강
  primaryLight: '#F8E5E7',   // 매우 연한 빨강 (배경용)
  secondary: '#457B9D',      // 보조 컬러 (파랑)
  accent: '#F1FAEE',         // 강조 컬러 (크림)
};

// 기존 초록색을 새 빨간색으로 교체하는 유틸리티
export function getThemeClass(oldClass: string): string {
  return oldClass
    .replace(/bg-\[#00A862\]/g, 'bg-[#E63946]')
    .replace(/text-\[#00A862\]/g, 'text-[#E63946]')
    .replace(/border-\[#00A862\]/g, 'border-[#E63946]')
    .replace(/hover:bg-\[#008F54\]/g, 'hover:bg-[#D62828]')
    .replace(/from-\[#00A862\]/g, 'from-[#E63946]')
    .replace(/to-\[#00C896\]/g, 'to-[#F8757D]');
}

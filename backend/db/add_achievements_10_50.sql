-- 10회, 50회 이용 달성 업적 추가
INSERT INTO achievements (name, description, icon, condition_type, condition_value) VALUES
('초보 라이더', '10회 이용 달성', '🚲', 'TOTAL_RIDES', 10),
('중급 라이더', '50회 이용 달성', '🚴', 'TOTAL_RIDES', 50)
ON CONFLICT DO NOTHING;


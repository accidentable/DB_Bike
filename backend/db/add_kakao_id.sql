-- 카카오 로그인을 위한 kakao_id 필드 추가
ALTER TABLE members ADD COLUMN IF NOT EXISTS kakao_id BIGINT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_members_kakao_id ON members(kakao_id);


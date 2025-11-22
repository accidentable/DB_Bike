# 🚲 따릉이 백엔드 (Ddareungi-Backend)

이 프로젝트는 '따릉이' 서비스의 Node.js/Express 백엔드 서버입니다.
개발 환경의 통일을 위해 데이터베이스는 Docker (PostgreSQL)를 사용합니다.

현재 Supabase KV 스토어 기반의 프로토타입을 PostgreSQL 기반의 아키텍처로 마이그레이션하는 작업을 진행 중입니다.

### docker 실행 시 되지 않으면 
1. netstat -ano | findstr :5432
2. taskkill /PID ---- /F
3. taskkill /PID ---- /F
---

## 🚀 1. 개발 환경 설정 (필수)

모든 팀원은 개발 시작 전 다음 3단계를 완료해야 합니다.

### 준비물
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (DB 실행용)
* [Node.js](https://nodejs.org/ko) (v18 이상 권장)

---

### 1단계: 프로젝트 클론 및 종속성 설치

```bash
# 1. 이 저장소를 클론받습니다.
git clone [여기에 Git Repository URL을 입력하세요]

# 2. 프로젝트 폴더로 이동합니다.
cd ddareungi-backend

# 3. Node.js 패키지를 설치합니다.
npm install 
```

---

2단계: .env 파일 생성 (중요)
프로젝트 루트(package.json과 같은 위치)에 .env 파일을 직접 생성하고, 아래 내용을 복사/붙여넣기 하세요.

이 파일은 Git으로 관리되지 않으므로 각자 PC에서 생성해야 합니다.

코드 스니펫

```bash
# Node.js 서버 설정
NODE_ENV=development
PORT=3000

# JWT 시크릿 키 (보안을 위해 복잡한 문자열로 변경하세요)
JWT_SECRET_KEY=my_super_secret_key_change_this!

# DB 연결 정보 (docker-compose.yml과 동일하게 설정)
DB_USER=myadmin
DB_PASSWORD=mypassword123
DB_NAME=ddareungi
DB_HOST=localhost
DB_PORT=5432

```
---
3단계: Docker DB 실행
터미널에서 ddareungi-backend 폴더가 맞는지 확인한 후, 다음 명령어를 실행하세요.


```bash
# Docker Desktop이 실행 중이어야 합니다.
docker-compose up -d
```

- 이 명령어는 docker-compose.yml 파일을 읽어 백그라운드에서 PostgreSQL 데이터베이스를 실행합니다.

- 최초 실행 시 db/init.sql 파일을 자동으로 읽어 테이블을 생성합니다.

- 이제 localhost:5432로 DB에 접속할 수 있습니다.



📁 3. 백엔드 폴더 구조
이 프로젝트는 **계층형 아키텍처(Layered Architecture)**를 따릅니다. 각 폴더의 역할이 명확히 분리되어 있어 협업과 유지보수에 용이합니다.

src/


api/ (Controllers / Routes) 

역할: "문지기". HTTP 요청(Request)을 받고 응답(Response)을 보냅니다.

req.body 등을 분석해 services 계층에 작업을 요청합니다.

(예: auth.routes.js, rental.routes.js)


services/ (Business Logic) 

역할: "브레인". 실제 비즈니스 로직을 처리합니다.

비밀번호 암호화, JWT 생성, 데이터 가공 등 '실제 일'을 합니다.

repositories를 호출하여 DB 작업을 수행합니다.

(예: auth.service.js, rental.service.js)


repositories/ (Data Access) 

역할: "DB 창고 관리자". 오직 DB와만 통신합니다.

services의 요청을 받아 실제 SQL 쿼리를 실행하고 결과를 반환합니다.

(예: member.repository.js, rental.repository.js)


middleware/ (Middleware) 

역할: "검문소". api 라우터에 도달하기 전/후에 공통 작업을 처리합니다.

(예: auth.middleware.js - JWT 토큰 검증, admin.middleware.js - 관리자 권한 검증)


config/ (Configuration) 

역할: 설정 파일.

(예: db.config.js - PostgreSQL DB 연결 풀 설정)

db/

init.sql: Docker가 처음 실행될 때 읽어오는 테이블 생성(CREATE TABLE) SQL 파일입니다.

docker-compose.yml: 개발용 PostgreSQL DB의 설계도입니다.

app.js: Express 앱의 전역 미들웨어와 라우터를 조립하는 파일입니다.

server.js: 실제 서버를 실행하는 파일입니다.


🐳 4. (참고) Docker 명령어 팁

```bash
# 1. DB 끄기 (데이터는 보존됨)
docker-compose down

# 2. DB 완전 초기화 (데이터 + 테이블 모두 삭제)
# (db/init.sql을 수정했거나 DB를 깨끗하게 밀고 싶을 때 사용)
docker-compose down -v
```

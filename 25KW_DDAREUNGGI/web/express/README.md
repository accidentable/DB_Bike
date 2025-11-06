# Express

## DB(SQL) 관리

MySQL 기준으로 SQL 스키마/시드/데모 파일과 실행 스크립트를 제공합니다.

폴더 구조

- sql/schema: 테이블 생성 스크립트(여러 버전 제공)
- sql/seeds: 초기 데이터(mock) 삽입
- sql/demos: 시나리오 데모 쿼리
- scripts/run-sql.js: SQL 파일 실행기

설정

1) `.env` 파일을 프로젝트 루트(web/express)에 생성하여 DB 접속 정보를 설정하세요.

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ddareung
```

2) 의존성 설치

```
npm install
```

사용 방법

- 스키마 생성(버전 중 택1 실행)

```
npm run db:schema:newtable
npm run db:schema:table
npm run db:schema:ddareung
```

- 시드 데이터 삽입

```
npm run db:seed:input
```

- 데모 시나리오 실행

```
npm run db:demo:rental
npm run db:demo:ddareung_rent
```

임의의 SQL 파일 실행

```
npm run db:run -- path/to/file.sql
```

## PostgreSQL(SQL) 관리

Postgres 전용 스키마/시드/데모와 실행 스크립트를 제공합니다.

폴더 구조

- sql/postgres/schema: Postgres 테이블 생성(예: MakeTable.sql)
- sql/postgres/seeds: Postgres 초기 데이터(예: InputData.sql)
- sql/postgres/demos: Postgres 데모/고급 쿼리(예: ddlall.sql)
- scripts/run-sql-pg.js: Postgres SQL 실행기

설정(.env)

```
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=ddareung
```

의존성 설치

```
npm install
```

사용 방법

```
npm run pg:schema:make
npm run pg:seed:input
npm run pg:demo:ddlall

# 임의 파일 실행
npm run pg:run -- path/to/file.sql
```

## API 개요 (초안)

환경 변수(.env)

```
JWT_SECRET=change_me
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=ddareung
# (프론트에서 사용) KAKAO_MAP_API_KEY=your_kakao_js_key
```

인증

- POST /api/auth/signup { username, email, password }
- POST /api/auth/login { username, password }
  - 응답: { token, member }
  - Authorization: Bearer <token>

대여/반납

- POST /api/rentals/start { bike_id, start_station_id }
- POST /api/rentals/return { bike_id, end_station_id }
- GET /api/rentals/nearby?lat=...&lon=... (Bearer 필요)

카카오맵 연동 가이드

- 프론트에서 Kakao 지도 SDK 로드 시 `.env`의 KAKAO_MAP_API_KEY 사용
- 가까운 대여소 목록은 GET /api/rentals/nearby 결과를 활용해 마커 렌더링
- 클릭 시 대여/반납 버튼을 노출하고 위의 POST API를 호출



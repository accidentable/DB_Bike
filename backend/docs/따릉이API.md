네, `README.md` 파일에서 **스케줄러와 실제 API 데이터 연동**에 관한 부분만 따로 정리해서 하나의 파일처럼 만들어 드릴게요.

아래 `markdown` 코드 블록의 오른쪽 상단 '복사' 버튼을 눌러서 `README_SCHEDULER.md` 같은 파일로 저장하거나 팀원에게 바로 공유하시면 됩니다.

````markdown
# 🚲 따릉이 API 스케줄러 가이드

이 문서는 서울시 따릉이 API와 연동된 **배치 스케줄러**를 실행하고 테스트하는 방법을 설명합니다.

**전제 조건:** `npm install`이 완료되었고, `.env` 파일에 `SEOUL_API_KEY` 및 DB 정보가 올바르게 입력되어 있어야 합니다.

---

## 🚀 스케줄러 실행 방법 (최초 1회 설정)

`init.sql`의 목업 데이터 대신, **서울시 실제 데이터**로 DB를 채우는 과정입니다. **최초 1회만** 이 순서대로 실행하면 됩니다.

### 1단계: (필수) DB 초기화

`init.sql`의 목업 데이터(`강남역` 3개 등)가 저장된 볼륨을 **완전히 삭제**합니다.

```bash
# (서버는 꺼진 상태여야 함)
docker-compose down -v
````

### 2단계: DB 컨테이너 실행

`init.sql`의 **비어있는 테이블** 스키마만 생성하기 위해 Docker 컨테이너를 띄웁니다.

```bash
docker-compose up -d
```

### 3단계: (핵심) 1회성 데이터 주입

`npm run dev`가 **아닌**, `populateStations.js` 스크립트를 Node.js로 직접 실행합니다. 이 스크립트가 서울시 API를 호출하여 실제 대여소 정보와 가상 자전거 데이터를 DB에 `INSERT`합니다.

```bash
node populateStations.js
```

  * **확인:** 터미널에 "총 27XX개의 대여소 정보를 가져왔습니다." 및 "XXXXX개의 가상 자전거가 DB에 저장되었습니다."라는 성공 메시지가 뜨는지 확인합니다.

### 4단계: 서버 및 스케줄러 실행

이제 모든 데이터가 준비되었습니다. `npm run dev`로 메인 서버를 실행합니다.

```bash
npm run dev
```

  * 서버가 시작됨과 동시에 `scheduler.service.js`가 활성화되어, **즉시 1회**, 그 후 **5분마다** 실시간 재고를 자동으로 `UPDATE`합니다.

-----

## ⏰ 스케줄러 작동 방식

우리 백엔드는 2단계로 실제 데이터를 관리합니다.

1.  **`populateStations.js` (1회성 수동 실행)**

      * **역할:** `init.sql`의 빈 테이블에 서울시 API의 **고정 데이터**(대여소 이름, 위도, 경도)를 `INSERT`합니다.
      * **핵심:** 각 대여소의 '초기 재고'(`bike_count`)만큼 **가상의 `bikes` 데이터**를 생성하여 `bikes` 테이블에 `INSERT`합니다.
      * **실행:** `node populateStations.js` (개발 환경 최초 설정 시 1회)

2.  **`scheduler.service.js` (자동 실행)**

      * **역할:** `server.js`가 실행되면 **5분마다** 서울시 API를 자동으로 호출하여, \*\*실시간 재고(`parkingBikeTotCnt`)\*\*만 가져옵니다.
      * **핵심:** `stations` 테이블의 `bike_count` 컬럼만 최신 숫자로 \*\*`UPDATE`\*\*합니다. (가상 `bikes` 데이터는 건드리지 않습니다.)
      * **실행:** `npm run dev` 실행 시 자동으로 활성화됩니다.

-----

## 🐳 (참고) Docker 명령어 팁

```bash
# 1. DB 끄기 (데이터는 보존됨)
docker-compose down

# 2. DB 완전 초기화 (데이터 + 테이블 모두 삭제)
# (스키마(init.sql)를 변경했거나, 'node populateStations.js'를 다시 실행하고 싶을 때 사용)
docker-compose down -v
```

```
```
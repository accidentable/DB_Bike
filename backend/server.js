// server.js
//  서버 시작

const app = require('./app'); // app.js에서 설정한 Express 앱 가져오기

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
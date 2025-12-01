/**
 * src/services/weekly-ranking-scheduler.js
 * 주별 랭킹 계산 및 보상 지급 스케줄러
 * 매주 월요일 00:00에 실행
 */

const schedule = require('node-schedule');
const rankingService = require('./ranking.service');

/**
 * 매주 월요일 00:00에 실행
 * cron 형식: '0 0 * * 1' (매주 월요일 00:00)
 */
const startWeeklyRankingScheduler = () => {
  // 매주 월요일 00:00에 실행
  const job = schedule.scheduleJob('0 0 * * 1', async () => {
    try {
      console.log('[스케줄러] 주별 랭킹 계산 및 보상 지급 시작...');
      const result = await rankingService.processLastWeekRanking();
      console.log('[스케줄러] 주별 랭킹 처리 완료:', result);
    } catch (error) {
      console.error('[스케줄러] 주별 랭킹 처리 중 오류:', error);
    }
  });

  console.log('[스케줄러] 주별 랭킹 스케줄러가 시작되었습니다. (매주 월요일 00:00)');
  return job;
};

module.exports = {
  startWeeklyRankingScheduler
};
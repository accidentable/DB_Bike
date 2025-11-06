const express = require('express');
const auth = require('../middleware/auth');
const { getClient } = require('../db/pg');

const router = express.Router();

// 대여 시작
router.post('/start', auth, async (req, res) => {
  const { bike_id, start_station_id } = req.body || {};
  if (!bike_id || !start_station_id) return res.status(400).json({ message: 'Missing fields' });
  const memberId = req.user.memberId;

  const client = await getClient();
  try {
    await client.query('BEGIN');
    // 1) 현재 자전거 상태 확인 및 잠금 상태
    const bike = await client.query(
      "SELECT bike_id, status, lock_status, station_id FROM bikes WHERE bike_id = $1 FOR UPDATE",
      [bike_id]
    );
    if (bike.rowCount === 0) throw new Error('Bike not found');
    const b = bike.rows[0];
    if (!(b.status === '정상' || b.status === 'available') || !(b.lock_status === 'LOCKED' || b.lock_status === 'locked')) {
      throw new Error('Bike not available');
    }

    // 2) 대여 기록 생성
    await client.query(
      'INSERT INTO rentals (member_id, bike_id, start_station_id, start_time) VALUES ($1, $2, $3, NOW())',
      [memberId, bike_id, start_station_id]
    );

    // 3) 자전거 상태 변경
    await client.query(
      "UPDATE bikes SET status = '대여중', lock_status = 'IN_USE', station_id = NULL WHERE bike_id = $1",
      [bike_id]
    );

    // 4) 대여소 자전거 수 감소
    await client.query(
      'UPDATE stations SET bike_count = bike_count - 1 WHERE station_id = $1 AND bike_count > 0',
      [start_station_id]
    );

    // 5) 사용자 last_bike_id 갱신
    await client.query('UPDATE members SET last_bike_id = $1 WHERE member_id = $2', [bike_id, memberId]);

    await client.query('COMMIT');
    return res.json({ message: 'rental_started' });
  } catch (e) {
    await client.query('ROLLBACK');
    return res.status(400).json({ message: e.message || 'Rental start failed' });
  } finally {
    client.release();
  }
});

// 대여 반납
router.post('/return', auth, async (req, res) => {
  const { bike_id, end_station_id } = req.body || {};
  if (!bike_id || !end_station_id) return res.status(400).json({ message: 'Missing fields' });
  const memberId = req.user.memberId;

  const client = await getClient();
  try {
    await client.query('BEGIN');
    // 1) 진행 중 대여 기록 갱신
    const upd = await client.query(
      'UPDATE rentals SET end_time = NOW(), end_station_id = $1 WHERE member_id = $2 AND bike_id = $3 AND end_time IS NULL',
      [end_station_id, memberId, bike_id]
    );
    if (upd.rowCount === 0) throw new Error('No active rental');

    // 2) 자전거 상태 반납 처리
    await client.query(
      "UPDATE bikes SET status = '정상', lock_status = 'LOCKED', station_id = $1 WHERE bike_id = $2",
      [end_station_id, bike_id]
    );

    // 3) 대여소 자전거 수 증가
    await client.query('UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1', [end_station_id]);

    await client.query('COMMIT');
    return res.json({ message: 'rental_returned' });
  } catch (e) {
    await client.query('ROLLBACK');
    return res.status(400).json({ message: e.message || 'Rental return failed' });
  } finally {
    client.release();
  }
});

// 근처 대여소 조회 (Kakao Map 용 데이터)
router.get('/nearby', auth, async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!lat || !lon) return res.status(400).json({ message: 'lat/lon required' });

  // Haversine 유사 계산 (Postgres)
  const radius = 6371; // km
  const sql = `
    SELECT station_id, name, latitude, longitude, bike_count,
      (${radius} * ACOS(
        COS(RADIANS($1)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS($2)) +
        SIN(RADIANS($1)) * SIN(RADIANS(latitude))
      )) AS distance_km
    FROM stations
    WHERE status = '정상' AND bike_count >= 0
    ORDER BY distance_km ASC
    LIMIT 20
  `;
  try {
    const { query } = require('../db/pg');
    const r = await query(sql, [lat, lon]);
    return res.json(r.rows);
  } catch (e) {
    return res.status(500).json({ message: 'Nearby failed' });
  }
});

module.exports = router;



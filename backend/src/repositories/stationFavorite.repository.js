const pool = require('../config/db.config');

const stationFavoriteRepository = {
  /**
   * Add station to member favorites.
   */
  addFavorite: async (memberId, stationId) => {
    const sql = `
      INSERT INTO station_favorites (member_id, station_id)
      VALUES ($1, $2)
      ON CONFLICT (member_id, station_id) DO NOTHING
      RETURNING favorite_id
    `;
    const { rows } = await pool.query(sql, [memberId, stationId]);
    return { alreadyFavorited: rows.length === 0 };
  },

  /**
   * Remove station from favorites.
   */
  removeFavorite: async (memberId, stationId) => {
    const sql = `
      DELETE FROM station_favorites
      WHERE member_id = $1 AND station_id = $2
      RETURNING favorite_id
    `;
    const { rows } = await pool.query(sql, [memberId, stationId]);
    return { notFavorited: rows.length === 0 };
  },

  /**
   * List favorites for a member with station info.
   */
  listFavoritesByMember: async (memberId) => {
    const sql = `
      SELECT
        sf.station_id,
        s.name,
        s.latitude,
        s.longitude,
        s.status,
        s.bike_count,
        sf.created_at
      FROM station_favorites sf
      JOIN stations s ON sf.station_id = s.station_id
      WHERE sf.member_id = $1
      ORDER BY sf.created_at DESC
    `;
    const { rows } = await pool.query(sql, [memberId]);
    return rows;
  },

  /**
   * Check if station is favorited by member.
   */
  isFavorited: async (memberId, stationId) => {
    const sql = `
      SELECT 1
      FROM station_favorites
      WHERE member_id = $1 AND station_id = $2
    `;
    const { rows } = await pool.query(sql, [memberId, stationId]);
    return rows.length > 0;
  }
};

module.exports = stationFavoriteRepository;

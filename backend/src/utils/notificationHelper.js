const { Op } = require('sequelize');
const { Notifikasi, NotifikasiState } = require('../models');

const DEFAULT_COOLDOWN_MS = Number(process.env.NOTIFICATION_COOLDOWN_MS || 2 * 60 * 1000);

const getNotificationsClearedAt = async (userId) => {
  const state = await NotifikasiState.findByPk(userId);
  return state?.notifications_cleared_at || null;
};

const isOlderThanClearTime = (sourceCreatedAt, clearedAt) => {
  if (!sourceCreatedAt || !clearedAt) return false;
  return new Date(sourceCreatedAt).getTime() <= new Date(clearedAt).getTime();
};

const createNotificationWithCooldown = async ({
  user_id,
  laporan_id = null,
  title,
  message,
  type = 'info',
  catatan_teknisi = null,
  source_created_at = null,
  cooldownMs = DEFAULT_COOLDOWN_MS
}) => {
  if (!user_id || !title || !message) return null;

  const clearedAt = await getNotificationsClearedAt(user_id);
  if (isOlderThanClearTime(source_created_at, clearedAt)) return null;

  const cooldownDate = new Date(Date.now() - cooldownMs);
  const where = {
    user_id,
    laporan_id,
    title,
    message,
    type,
    created_at: { [Op.gte]: cooldownDate }
  };

  const existing = await Notifikasi.findOne({ where });
  if (existing) return existing;

  return Notifikasi.create({
    user_id,
    laporan_id,
    title,
    message,
    type,
    catatan_teknisi
  });
};

module.exports = {
  createNotificationWithCooldown
};

import { findMenuItems } from '../models/menuModel.js';

export async function getMenu(req, res, next) {
  try {
    const menu = await findMenuItems();
    res.json({ status: 'success', data: menu });
  } catch (err) {
    next(err);
  }
}

import bcrypt from 'bcryptjs';
import {
  createCustomer,
  findUserByEmailWithPassword,
  toPublicUser,
} from '../models/userModel.js';
import { signAuthToken } from '../utils/auth.js';

function unauthorized() {
  const err = new Error('Email o password invalidos');
  err.statusCode = 401;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createSessionPayload(user) {
  const publicUser = toPublicUser(user);
  const token = signAuthToken(publicUser);

  return {
    user: publicUser,
    token,
  };
}

export async function registerCustomer(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const phone = String(req.body.phone || '').trim();
    const password = String(req.body.password || '');

    if (!name) throw badRequest('El nombre es requerido');
    if (!email) throw badRequest('El email es requerido');
    if (!phone) throw badRequest('El WhatsApp es requerido');
    if (password.length < 6) {
      throw badRequest('El password debe tener al menos 6 caracteres');
    }

    const existingUser = await findUserByEmailWithPassword(email);
    if (existingUser) throw badRequest('Ya existe una cuenta con ese email');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createCustomer({ name, email, phone, passwordHash });

    res.status(201).json({
      status: 'success',
      data: createSessionPayload(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw unauthorized();

    const user = await findUserByEmailWithPassword(email);
    if (!user) throw unauthorized();

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) throw unauthorized();

    res.json({
      status: 'success',
      data: createSessionPayload(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({
    status: 'success',
    data: { user: req.user },
  });
}

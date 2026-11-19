import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
export const authRouter = Router();
const credentials = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });
authRouter.post('/register', async (req, res, next) => {
  try {
    const parsed = credentials.extend({ name: z.string().min(2).max(80), role: z.enum(['STUDENT','TEACHER']).default('STUDENT') }).parse(req.body);
    const email = parsed.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({ data: { name: parsed.name, email, passwordHash, role: parsed.role, ...(parsed.role === 'STUDENT' ? { student: { create: { rollNumber: `STU-${Date.now()}-${Math.floor(Math.random()*1000)}` } } } : { teacher: { create: { employeeNumber: `TCH-${Date.now()}-${Math.floor(Math.random()*1000)}` } } }) } });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { id: req.user.sub }, select: { id:true,name:true,email:true,role:true } }); res.json({ user }); }
  catch (e) { next(e); }
});
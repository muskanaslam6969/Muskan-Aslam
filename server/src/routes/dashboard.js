import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';
export const dashboardRouter = Router();
dashboardRouter.get('/summary', requireAuth, allowRoles('ADMIN','TEACHER','STUDENT'), async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    if (req.user.role === 'ADMIN') {
      const [students, teachers, courses, records, present] = await Promise.all([
        prisma.student.count(), prisma.teacher.count(), prisma.course.count(),
        prisma.attendance.count({ where: { date: { gte: today } } }),
        prisma.attendance.count({ where: { date: { gte: today }, status: 'PRESENT' } })
      ]);
      return res.json({ students, teachers, courses, attendanceToday: records ? Math.round(present / records * 100) : 0 });
    }
    if (req.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.sub }, select: { id:true, courses: { select: { id:true, _count: { select: { enrollments:true } } } } } });
      return res.json({ courses: teacher?.courses.length || 0, students: teacher?.courses.reduce((n,c)=>n+c._count.enrollments,0) || 0 });
    }
    const student = await prisma.student.findUnique({ where: { userId: req.user.sub }, select: { id:true, enrollments: { select: { courseId:true } }, attendance: { select: { status:true } } } });
    const total = student?.attendance.length || 0;
    const presentCount = student?.attendance.filter(a=>a.status === 'PRESENT').length || 0;
    return res.json({ courses: student?.enrollments.length || 0, attendance: total ? Math.round(presentCount/total*100) : 0 });
  } catch (e) { next(e); }
});
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

export const resourcesRouter = Router();
resourcesRouter.use(requireAuth);

resourcesRouter.get('/students', async (req,res,next)=>{
  try {
    let where={};
    if(req.user.role==='STUDENT') where={userId:req.user.sub};
    if(req.user.role==='TEACHER'){
      const teacher=await prisma.teacher.findUnique({where:{userId:req.user.sub}});
      if(!teacher) return res.json([]);
      where={enrollments:{some:{course:{teacherId:teacher.id}}}};
    }
    const rows=await prisma.student.findMany({where,include:{user:{select:{id:true,name:true,email:true,isActive:true}},department:true,semester:true},orderBy:{user:{name:'asc'}}});
    res.json(rows);
  } catch(e){next(e);}
});

resourcesRouter.post('/students',allowRoles('ADMIN'),async(req,res,next)=>{
  try{
    const input=z.object({name:z.string().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(128),rollNumber:z.string().min(1).max(40),departmentId:z.string().optional(),semesterId:z.string().optional()}).parse(req.body);
    const passwordHash=await bcrypt.hash(input.password,12);
    const student=await prisma.student.create({data:{rollNumber:input.rollNumber,departmentId:input.departmentId,semesterId:input.semesterId,user:{create:{name:input.name,email:input.email.toLowerCase(),passwordHash,role:'STUDENT'}}},include:{user:{select:{id:true,name:true,email:true}},department:true,semester:true}});
    res.status(201).json(student);
  }catch(e){next(e);}
});

resourcesRouter.get('/teachers',async(req,res,next)=>{
  try{
    let where={};
    if(req.user.role==='TEACHER') where={userId:req.user.sub};
    if(req.user.role==='STUDENT'){
      const student=await prisma.student.findUnique({where:{userId:req.user.sub},include:{enrollments:{select:{course:{select:{teacherId:true}}}}}});
      const ids=(student?.enrollments||[]).map(x=>x.course.teacherId).filter(Boolean);
      where={id:{in:ids}};
    }
    const rows=await prisma.teacher.findMany({where,include:{user:{select:{id:true,name:true,email:true}},department:true,courses:{select:{id:true,code:true,title:true}}},orderBy:{user:{name:'asc'}}});
    res.json(rows);
  }catch(e){next(e);}
});

resourcesRouter.post('/teachers',allowRoles('ADMIN'),async(req,res,next)=>{
  try{
    const input=z.object({name:z.string().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(128),employeeNumber:z.string().min(1).max(40),departmentId:z.string().optional()}).parse(req.body);
    const passwordHash=await bcrypt.hash(input.password,12);
    const teacher=await prisma.teacher.create({data:{employeeNumber:input.employeeNumber,departmentId:input.departmentId,user:{create:{name:input.name,email:input.email.toLowerCase(),passwordHash,role:'TEACHER'}}},include:{user:{select:{id:true,name:true,email:true}},department:true}});
    res.status(201).json(teacher);
  }catch(e){next(e);}
});

resourcesRouter.get('/courses',async(req,res,next)=>{
  try{
    let where={};
    if(req.user.role==='TEACHER') where={teacher:{userId:req.user.sub}};
    if(req.user.role==='STUDENT') where={enrollments:{some:{student:{userId:req.user.sub}}}};
    const rows=await prisma.course.findMany({where,include:{teacher:{include:{user:{select:{name:true,email:true}}}},department:true,semester:true,_count:{select:{enrollments:true}}},orderBy:{title:'asc'}});
    res.json(rows);
  }catch(e){next(e);}
});

resourcesRouter.post('/courses',allowRoles('ADMIN'),async(req,res,next)=>{
  try{
    const input=z.object({code:z.string().min(2).max(20),title:z.string().min(2).max(120),description:z.string().max(1000).optional(),credits:z.number().int().min(1).max(12).default(3),teacherId:z.string().optional(),departmentId:z.string().optional(),semesterId:z.string().optional()}).parse(req.body);
    const course=await prisma.course.create({data:input,include:{teacher:{include:{user:{select:{name:true}}}},department:true,semester:true}});
    res.status(201).json(course);
  }catch(e){next(e);}
});

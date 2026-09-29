const express = require('express');   // استدعاء مكتبة express
const fs = require('fs');             // مكتبة قراءة وكتابة الملفات
const path = require('path');         // مكتبة التعامل مع المسارات

const app = express();                // إنشاء التطبيق
const FILE = path.join(__dirname, 'tasks.json'); // ملف حفظ المهام

app.use(express.json());                                 // قراءة البيانات القادمة بصيغة JSON
app.use(express.static(path.join(__dirname, 'public'))); // تقديم صفحات الفرونت اند

// قراءة كل المهام من الملف
const load = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : []);
// حفظ المهام في الملف
const save = (tasks) => fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));

// جلب كل المهام
app.get('/api/tasks', (req, res) => res.json(load()));

// إضافة مهمة جديدة
app.post('/api/tasks', (req, res) => {
  const title = (req.body.title || '').trim();           // أخذ العنوان وحذف المسافات
  if (!title) return res.status(400).json({ error: 'العنوان مطلوب' }); // رفض العنوان الفارغ
  const tasks = load();
  const task = { id: Date.now(), title, done: false };   // رقم فريد وحالة غير منجزة
  tasks.push(task);
  save(tasks);
  res.status(201).json(task);
});

// تعديل مهمة (العنوان أو حالة الإنجاز)
app.put('/api/tasks/:id', (req, res) => {
  const tasks = load();
  const task = tasks.find((t) => t.id === Number(req.params.id)); // البحث بالرقم
  if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });
  if (req.body.title !== undefined) task.title = String(req.body.title).trim();
  if (req.body.done !== undefined) task.done = Boolean(req.body.done);
  save(tasks);
  res.json(task);
});

// حذف مهمة
app.delete('/api/tasks/:id', (req, res) => {
  const tasks = load().filter((t) => t.id !== Number(req.params.id)); // إبقاء باقي المهام
  save(tasks);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

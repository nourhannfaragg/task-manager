import { Component, inject, signal, OnInit } from '@angular/core'; // أدوات أنجولار الأساسية
import { FormsModule } from '@angular/forms';                      // لربط حقل الإدخال بالمتغير
import { HttpClient } from '@angular/common/http';                 // لإرسال الطلبات للسيرفر

interface Task { id: number; title: string; done: boolean; }      // شكل بيانات المهمة

@Component({
  selector: 'app-root',       // اسم الوسم الذي يظهر به المكون
  imports: [FormsModule],     // المكتبات المستخدمة داخل القالب
  templateUrl: './app.html',  // ملف القالب
  styleUrl: './app.css',      // ملف التصميم
})
export class App implements OnInit {
  private http = inject(HttpClient);   // الحصول على HttpClient
  private api = '/api/tasks';          // رابط الباك اند
  tasks = signal<Task[]>([]);          // قائمة المهام، وأي تغيير فيها يحدّث الشاشة
  newTitle = '';                       // نص المهمة الجديدة

  ngOnInit() { this.load(); }          // عند فتح الصفحة، اجلب المهام

  load() {                             // جلب كل المهام
    this.http.get<Task[]>(this.api).subscribe((t) => this.tasks.set(t));
  }

  add() {                              // إضافة مهمة
    const title = this.newTitle.trim();  // حذف المسافات الزائدة
    if (!title) return;                  // تجاهل النص الفارغ
    this.http.post<Task>(this.api, { title }).subscribe(() => {
      this.newTitle = '';                // تفريغ الحقل
      this.load();                       // تحديث القائمة
    });
  }

  toggle(t: Task) {                    // عكس حالة الإنجاز
    this.http.put(`${this.api}/${t.id}`, { done: !t.done }).subscribe(() => this.load());
  }

  edit(t: Task) {                      // تعديل عنوان المهمة
    const title = prompt('عدّل المهمة', t.title);   // نافذة إدخال بالعنوان الحالي
    if (title && title.trim()) {
      this.http.put(`${this.api}/${t.id}`, { title }).subscribe(() => this.load());
    }
  }

  remove(t: Task) {                    // حذف مهمة
    this.http.delete(`${this.api}/${t.id}`).subscribe(() => this.load());
  }
}

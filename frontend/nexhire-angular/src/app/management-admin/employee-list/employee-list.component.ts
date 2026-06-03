import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-employee-list', templateUrl: './employee-list.component.html', standalone: false })
export class EmployeeListComponent implements OnInit, AfterViewInit {
  employees: EmployeeDto[] = [];
  filtered: EmployeeDto[] = [];
  search = '';
  showDialog = false;
  editMode = false;
  selectedId = 0;
  loading = true;
  dataLoaded = false;

  form: CreateEmployeeDto = this.emptyForm();

  constructor(private hrms: HrmsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.hrms.getEmployees().subscribe({
      next: e => {
        this.employees = e;
        this.applyFilter();
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.employees.filter(e =>
      e.fullName.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q));
  }

  openCreate() { this.form = this.emptyForm(); this.editMode = false; this.showDialog = true; }

  openEdit(e: EmployeeDto) {
    this.selectedId = e.id;
    this.form = { userId: e.userId, fullName: e.fullName, email: e.email, phone: e.phone, department: e.department, designation: e.designation, role: e.role, joiningDate: e.joiningDate, baseSalary: e.baseSalary };
    this.editMode = true;
    this.showDialog = true;
  }

  save() {
    if (this.editMode) {
      const upd: UpdateEmployeeDto = { phone: this.form.phone, department: this.form.department, designation: this.form.designation, status: 'Active', baseSalary: this.form.baseSalary };
      this.hrms.updateEmployee(this.selectedId, upd).subscribe(() => { this.showDialog = false; this.dataLoaded = false; this.load(); });
    } else {
      this.hrms.createEmployee(this.form).subscribe(() => { this.showDialog = false; this.dataLoaded = false; this.load(); });
    }
  }

  delete(id: number) {
    if (confirm('Delete this employee?')) this.hrms.deleteEmployee(id).subscribe(() => { this.dataLoaded = false; this.load(); });
  }

  private emptyForm(): CreateEmployeeDto {
    return { userId: 0, fullName: '', email: '', phone: '', department: '', designation: '', role: 'Employee', joiningDate: new Date().toISOString(), baseSalary: 0 };
  }
}

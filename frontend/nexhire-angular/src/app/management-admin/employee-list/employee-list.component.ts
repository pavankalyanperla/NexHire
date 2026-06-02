import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-employee-list', templateUrl: './employee-list.component.html', standalone: false })
export class EmployeeListComponent implements OnInit {
  employees: EmployeeDto[] = [];
  filtered: EmployeeDto[] = [];
  search = '';
  showDialog = false;
  editMode = false;
  selectedId = 0;
  loading = true;

  form: CreateEmployeeDto = this.emptyForm();

  constructor(private hrms: HrmsService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.hrms.getEmployees().subscribe({ next: e => { this.employees = e; this.applyFilter(); this.loading = false; }, error: () => this.loading = false });
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
      this.hrms.updateEmployee(this.selectedId, upd).subscribe(() => { this.showDialog = false; this.load(); });
    } else {
      this.hrms.createEmployee(this.form).subscribe(() => { this.showDialog = false; this.load(); });
    }
  }

  delete(id: number) {
    if (confirm('Delete this employee?')) this.hrms.deleteEmployee(id).subscribe(() => this.load());
  }

  private emptyForm(): CreateEmployeeDto {
    return { userId: 0, fullName: '', email: '', phone: '', department: '', designation: '', role: 'Employee', joiningDate: new Date().toISOString(), baseSalary: 0 };
  }
}

import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../core/models/hrms.model';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-employee-management', templateUrl: './employee-management.component.html', standalone: false })
export class EmployeeManagementComponent implements OnInit, AfterViewInit {
  employees: EmployeeDto[] = [];
  filtered: EmployeeDto[] = [];
  search = '';
  showDialog = false;
  editMode = false;
  selectedId = 0;
  loading = true;
  dataLoaded = false;
  form: CreateEmployeeDto = this.emptyForm();

  toastMsg = '';
  toastSeverity: 'success' | 'error' = 'success';
  showToastFlag = false;

  creatingAccount: {[id: number]: boolean} = {};
  accountCreated:  {[id: number]: boolean} = {};
  showCredentialsDialog = false;
  createdCredentials: any = null;

  constructor(private hrms: HrmsService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

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
    this.filtered = this.employees.filter(e => e.fullName.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
  }

  openCreate() { this.form = this.emptyForm(); this.editMode = false; this.showDialog = true; }

  openEdit(e: EmployeeDto) {
    this.selectedId = e.id;
    this.form = { ...e, joiningDate: e.joiningDate };
    this.editMode = true;
    this.showDialog = true;
  }

  save() {
    if (this.editMode) {
      this.hrms.updateEmployee(this.selectedId, { phone: this.form.phone, department: this.form.department, designation: this.form.designation, status: 'Active', baseSalary: this.form.baseSalary }).subscribe(() => {
        this.showDialog = false;
        this.dataLoaded = false;
        this.load();
      });
    } else {
      this.hrms.createEmployee(this.form).subscribe(() => {
        this.showDialog = false;
        this.dataLoaded = false;
        this.load();
      });
    }
  }

  toggleStatus(emp: EmployeeDto) {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    this.hrms.updateEmployee(emp.id, {
      phone: emp.phone, department: emp.department,
      designation: emp.designation, status: newStatus, baseSalary: emp.baseSalary
    }).subscribe({
      next: updated => {
        emp.status = updated.status;
        this.showToast(`${emp.fullName} marked as ${newStatus}`, 'success');
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Failed to update status', 'error')
    });
  }

  createEmployeeAccount(employee: any) {
    this.creatingAccount[employee.id] = true;
    const payload = {
      fullName:      employee.fullName,
      personalEmail: employee.email,
      department:    employee.department,
      designation:   employee.designation,
      role:          employee.role || 'Employee'
    };
    this.http.post(`${environment.apiUrl}/auth/create-staff-account`, payload).subscribe({
      next: (res: any) => {
        this.creatingAccount[employee.id] = false;
        this.accountCreated[employee.id]  = true;
        this.createdCredentials = {
          name:     res.fullName,
          email:    res.email,
          password: res.temporaryPassword,
          role:     res.role
        };
        this.showCredentialsDialog = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.creatingAccount[employee.id] = false;
        this.showToast(err.error?.message || 'Failed to create account', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  showToast(msg: string, severity: 'success' | 'error') {
    this.toastMsg      = msg;
    this.toastSeverity = severity;
    this.showToastFlag = true;
    setTimeout(() => { this.showToastFlag = false; this.cdr.detectChanges(); }, 3500);
    this.cdr.detectChanges();
  }

  private emptyForm(): CreateEmployeeDto {
    return { userId: 0, fullName: '', email: '', phone: '', department: '', designation: '', role: 'Employee', joiningDate: new Date().toISOString(), baseSalary: 0 };
  }
}

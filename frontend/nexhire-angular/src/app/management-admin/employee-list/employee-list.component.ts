import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-employee-list', templateUrl: './employee-list.component.html', standalone: false })
export class EmployeeListComponent implements OnInit, AfterViewInit {
  employees: EmployeeDto[] = [];
  filtered: EmployeeDto[] = [];
  search = '';
  loading = true;
  dataLoaded = false;

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
      e.fullName.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q));
  }
}

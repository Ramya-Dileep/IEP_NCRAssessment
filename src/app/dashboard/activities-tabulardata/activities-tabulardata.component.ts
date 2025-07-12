import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TabulardataService } from '../../service/tabulardata.service';
import { GridModule, GridDataResult, PageChangeEvent, DataStateChangeEvent,} from '@progress/kendo-angular-grid';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { HostListener, ElementRef } from '@angular/core';
import {ExcelExportModule} from '@progress/kendo-angular-excel-export';



import {
  SortDescriptor,
  CompositeFilterDescriptor
} from '@progress/kendo-data-query';

import {
  process,
  State
} from '@progress/kendo-data-query';
import { CommonModule } from '@angular/common';
import { FilterStateService } from '../../service/filter-state.service';

@Component({
  selector: 'app-activities-tabulardata',
  standalone: true,
  imports: [GridModule, CommonModule, ReactiveFormsModule, LoaderModule, InputsModule, FormsModule, PopupModule, ExcelExportModule ],
  templateUrl: './activities-tabulardata.component.html',
  styleUrl: './activities-tabulardata.component.scss'
})
export class ActivitiesTabulardataComponent implements OnInit, OnChanges {
  @Input() fullscreenMode = false;
  @Output() fullscreenToggled = new EventEmitter<boolean>();
  @Input() SelectedContracts: string[] = [];
  @Input() type: string = '';
  @Input() selectedMonthYear: string = ''; // e.g., "February 2023"
  @Input() openedFromChart = false; // <-- NEW input
@Output() closeTabularView = new EventEmitter<void>(); // <-- NEW output



  ispoData: any[] = [];
  filteredProjects: any[] = [];
  pagedData: GridDataResult = { data: [], total: 0 };
  searchControl = new FormControl('');
  loading = false;
  title :string = "Activities";

  skip = 0;
  pageSize = 5;
  sort: SortDescriptor[] = [];
  filter: CompositeFilterDescriptor = { logic: 'and', filters: [] };

  activeFilterColumn: string | null = null;


  // Filter changes
  columns = [
  { field: 'name', title: 'Name', width: 150 },
  { field: 'username', title: 'Username', width: 120 },
  // { field: 'email', title: 'Email', width: 180 },
  { field: 'contract', title: 'Contract', width: 150 },
  { field: 'street', title: 'Street', width: 120 },
  { field: 'city', title: 'City', width: 120 },
  // { field: 'zipcode', title: 'Zipcode', width: 120 },
  { field: 'year', title: 'Year', width: 120 },
  { field: 'month', title: 'Month', width: 120 }
];

columnFilters: { [key: string]: string[] } = {};
columnSelectedValues: { [key: string]: string[] } = {};
distinctValues: { [key: string]: string[] } = {};
filteredDistinctValues: { [key: string]: string[] } = {};
columnFilterSearch: { [key: string]: string } = {};

toggleColumnFilter(column: string): void {
  this.activeFilterColumn = this.activeFilterColumn === column ? null : column;

  if (this.activeFilterColumn) {
    const values = [...new Set(this.filteredProjects.map(p => p[column]))].filter(v => v !== undefined && v !== null);
    this.distinctValues[column] = values;
    this.filteredDistinctValues[column] = [...values];
    this.columnSelectedValues[column] = this.columnSelectedValues[column] || [];
    this.columnFilterSearch[column] = '';
  }
}

filterDistinctValues(column: string): void {
  const searchTerm = this.columnFilterSearch[column].toLowerCase();
  this.filteredDistinctValues[column] = this.distinctValues[column].filter(value =>
    value.toLowerCase().includes(searchTerm)
  );
}

onCheckboxChange(column: string, value: string, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  const selected = this.columnSelectedValues[column] || [];

  if (checked && !selected.includes(value)) {
    selected.push(value);
  } else if (!checked) {
    this.columnSelectedValues[column] = selected.filter(v => v !== value);
  }
}

applyColumnFilter(column: string): void {
  const selectedValues = this.columnSelectedValues[column];
  if (selectedValues.length > 0) {
    this.columnFilters[column] = selectedValues;
  } else {
    delete this.columnFilters[column];
  }

  this.activeFilterColumn = null;
  this.applyFilter(this.searchControl.value || '');
}

clearColumnFilter(column: string): void {
  delete this.columnFilters[column];
  this.columnSelectedValues[column] = [];
  this.applyFilter(this.searchControl.value || '');
  this.activeFilterColumn = null;
}

//anchor 
anchor: HTMLElement | null = null;


onFilterIconClick(event: MouseEvent, column: string): void {
  this.activeFilterColumn = column;
  this.anchor = event.target as HTMLElement;

  // Initialize distinct values
  const values = [...new Set(this.filteredProjects.map(p => p[column]))]
    .filter(v => v !== undefined && v !== null);

  this.distinctValues[column] = values;
  this.filteredDistinctValues[column] = [...values];
  this.columnSelectedValues[column] = this.columnSelectedValues[column] || [];
  this.columnFilterSearch[column] = '';
}

toggleFilterIcon(event: MouseEvent, column: string): void {
  event.stopPropagation(); // prevent event bubbling (optional, for safety)

  if (this.activeFilterColumn === column) {
    // Clicking again closes the popup
    this.activeFilterColumn = null;
    this.anchor = null;
  } else {
    // Open popup for this column
    this.activeFilterColumn = column;
    this.anchor = event.currentTarget as HTMLElement;

    // Initialize distinct values
    const values = [...new Set(this.filteredProjects.map(p => p[column]))]
      .filter(v => v !== undefined && v !== null);

    this.distinctValues[column] = values;
    this.filteredDistinctValues[column] = [...values];
    this.columnSelectedValues[column] = this.columnSelectedValues[column] || [];
    this.columnFilterSearch[column] = '';
  }
}


@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const clickedInsidePopup = this.elRef.nativeElement.querySelector('.filter-menu-popup')?.contains(event.target as Node);
  const clickedAnchor = this.anchor?.contains(event.target as Node);

  if (!clickedInsidePopup && !clickedAnchor) {
    this.activeFilterColumn = null;  // close popup
  }
}


  get isFullscreen(): boolean {
    return this.fullscreenMode;
  }

  constructor(private nbaService: TabulardataService, public filterState: FilterStateService, private elRef: ElementRef) {}

  // ngOnInit(): void {
  //   this.loading = true;

  //   this.nbaService.getTabledata().subscribe({
  //     next: data => {
  //       this.ispoData = data;
  //       this.filterByContracts();
  //       this.loading = false;
  //     },
  //     error: err => {
  //       console.error('Error loading data', err);
  //       this.loading = false;
  //     }
  //   });

  //   this.searchControl.valueChanges.subscribe(term => {
  //     this.applyFilter(term ?? '');
  //   });
  // }

  ngOnInit(): void {
  this.loadDataBasedOnType();

  this.searchControl.valueChanges.subscribe(term => {
    this.applyFilter(term ?? '');
  });
}

ngOnChanges(changes: SimpleChanges): void {
  // Dynamically update the title
  if (this.openedFromChart && this.selectedMonthYear) {
    this.title = `Tabular View - ${this.selectedMonthYear}`;
  } else {
    this.title = 'Activities';
  }

  // Refresh data if any input changes
  if (
    changes['SelectedContracts'] ||
    changes['type'] ||
    changes['selectedMonthYear'] ||
    changes['activeMode']
  ) {
    this.loadDataBasedOnType();
  }
}


private loadDataBasedOnType(): void {
  this.loading = true;

  const dataSource$ = this.type === 'Project'
    ? this.nbaService.getPojectTabledata()
    : this.nbaService.getTabledata();

  dataSource$.subscribe({
    next: data => {
      this.ispoData = data;

      // 🔍 Console logs for debugging
      const currentViewType = this.filterState.viewType();
      const currentDataType = this.filterState.dataType();
      const selectedMonthYear = this.selectedMonthYear;
      const openedFromChart = this.openedFromChart;

      console.log('--- 🔎 Debug Info: loadDataBasedOnType() ---');
      console.log('View Type:', currentViewType);
      console.log('Data Type:', currentDataType);
      console.log('Selected Month-Year:', selectedMonthYear);
      console.log('Selected Contracts:', this.SelectedContracts);
      console.log('Opened From Chart:', openedFromChart);
      console.log('Raw Data Count:', data.length);
      console.log('--------------------------------------------------');

      // Step 1: Filter by selected contracts
      let filtered = this.SelectedContracts.length > 0
        ? data.filter(d => this.SelectedContracts.includes(d.contract))
        : [];

      console.log('After contract filter:', filtered.length);

      // Step 2: Apply month-year filter only when it was a chart click
      const [month, year] = selectedMonthYear?.split(' ') ?? [];
      const applyMonthYearFilter = openedFromChart && currentViewType === 'Tabular' && month && year;

      if (applyMonthYearFilter) {
        filtered = filtered.filter(d => d.month === month && +d.year === +year);
        console.log(`After month-year filter (${month} ${year}):`, filtered.length);
      }

      // Step 3: Assign filtered data
      this.filteredProjects = filtered;
      this.skip = 0;
      this.loadPagedData();
      this.loading = false;

      console.log('✅ Final Filtered Data Count:', this.filteredProjects.length);
    },
    error: err => {
      console.error('❌ Error loading data', err);
      this.loading = false;
    }
  });
}





//commenting for implementing bar chart click

//  ngOnChanges(changes: SimpleChanges): void {
//   if ((changes['SelectedContracts'] && !changes['SelectedContracts'].firstChange) ||
//       (changes['type'] && !changes['type'].firstChange)) {
//     this.loadDataBasedOnType();  // 👈 custom method
//   }
// }

// private loadDataBasedOnType(): void {
//   this.loading = true;

//   const dataSource$ = this.type === 'Project'
//     ? this.nbaService.getPojectTabledata()
//     : this.nbaService.getTabledata();

//   dataSource$.subscribe({
//     next: data => {
//       this.ispoData = data;
//       this.filterByContracts();  // also filters by selected contracts
//       this.loading = false;
//     },
//     error: err => {
//       console.error('Error loading data', err);
//       this.loading = false;
//     }
//   });
// }


  toggleFilter(column: string): void {
  this.activeFilterColumn = this.activeFilterColumn === column ? null : column;
}


  toggleFullscreen(): void {
    this.fullscreenToggled.emit(!this.fullscreenMode);
  }


  onColumnFilterInput(): void {
    this.applyFilter(this.searchControl.value || '');
  }

  onPageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadPagedData();
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.skip = state.skip ?? 0;
    this.pageSize = state.take ?? 5;
    this.sort = state.sort ?? [];
    this.filter = state.filter as CompositeFilterDescriptor;
    this.loadPagedData();
  }


  applyFilter(term: string): void {
    const lowerTerm = term.toLowerCase();

    const globalFiltered = this.ispoData.filter(project =>
      this.deepSearch(project, lowerTerm)
    );

    const contractFiltered = this.SelectedContracts.length > 0
      ? globalFiltered.filter(project => this.SelectedContracts.includes(project.contract))
      : [];

    const columnFiltered = contractFiltered.filter(project => {
      return Object.entries(this.columnFilters).every(([key, selectedValues]) => {
        return selectedValues.includes(project[key]);
      });

    });

    this.filteredProjects = this.SelectedContracts.length === 0 ? [] : columnFiltered;

    this.skip = 0;
    this.loadPagedData();
  }

  filterByContracts(): void {
    if (!this.SelectedContracts || this.SelectedContracts.length === 0) {
      this.filteredProjects = []; // ✅ Clear table if no contracts
    } else {
      this.filteredProjects = this.ispoData.filter(project =>
        this.SelectedContracts.includes(project.contract) // change to `contract` if needed
      );
    }

    this.skip = 0;
    this.loadPagedData();
  }

private loadPagedData(): void {
    this.pagedData = process(this.filteredProjects, {
      skip: this.skip,
      take: this.pageSize,
      sort: this.sort,
      filter: this.filter
    });
  }

  private deepSearch(obj: any, searchTerm: string): boolean {
    if (typeof obj === 'string' || typeof obj === 'number') {
      return obj.toString().toLowerCase().includes(searchTerm);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => this.deepSearch(value, searchTerm));
    }

    return false;
  }

@ViewChild('excelExport', { static: false }) excelExport: any;


exportToExcel(): void {
  if (this.excelExport) {
    this.excelExport.save();
  }
}

onCloseClicked(): void {
  this.closeTabularView.emit(); // Notify parent to switch to chart
}

}


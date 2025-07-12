import { Component, computed, effect, EventEmitter, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KENDO_DATEINPUTS } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { AuthService } from '../../service/auth.service';
import { TabStripModule } from '@progress/kendo-angular-layout';
import {ActivitiesChartComponent} from '../../Common/activities-chart/activities-chart.component'
import { FilterActivitiesComponent } from '../filter-activities/filter-activities.component';
import { ActivitiesTabulardataComponent } from '../activities-tabulardata/activities-tabulardata.component';
import { FilterStateService } from '../../service/filter-state.service';

@Component({
  selector: 'app-maincontent-header',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    KENDO_DATEINPUTS,
    ButtonsModule,
    GridModule,
    DropDownsModule,
    FilterActivitiesComponent,
    ActivitiesTabulardataComponent,
    TabStripModule,
    ActivitiesChartComponent
  ],
  templateUrl: './maincontent-header.component.html',
  styleUrl: './maincontent-header.component.scss'
})
export class MaincontentHeaderComponent implements OnInit {
  @Input() ProjectName: string = 'IEP';
  @Input() SelectedContracts :string[] =[];
  @Input() fullscreenMode: boolean = false;
  @Output() fullscreenToggled = new EventEmitter<boolean>();

  moduleName = 'Quality';
  today = new Date();
  percentage = 71;
  activeTab: string = 'NCR';
  form!: FormGroup;
   hasReassignRequests = true;

  tabButtons = [
    { label: 'NCR', value: 'NCR' },
    { label: 'NCM', value: 'NCM' },
    { label: 'ECN/ECR', value: 'ECNECR' },
    { label: 'COQ', value: 'COQ' },
    { label: 'CCM', value: 'CCM' },
    { label: 'OTRDR', value: 'OTRDR' },
    { label: 'FMEA', value: 'FMEA' },
    { label: 'RCA-NCA-CAPA', value: 'RCA-NCA-CAPA' },
    { label: 'Product Quality', value: 'Product Quality' },
    { label: 'Product Safety', value: 'Product Safety' },
  ];

  constructor(private fb: FormBuilder, public authService : AuthService, public filterState :  FilterStateService) {}

  ngOnInit(): void {
    const group: any = {};
    this.form = this.fb.group(group);
     effect(() => {
    if (this.filterState.viewType() === 'Tabular' && !this.selectedMonthYear) {
      this.openedFromChart = false; // Reset flag if manually selected tabular
    }
  });
  }

  isTabular = computed(() => this.filterState.viewType() === 'Tabular');
  isChart = computed(() => this.filterState.viewType() === 'Chart');
  selectedType = computed(() => this.filterState.dataType());
  selectedMonthYear = computed(() => this.filterState.selectedMonthYear());


  toggleFullscreen() {
    this.fullscreenToggled.emit(!this.fullscreenMode);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

//   selectedMonthYear: string | null = null;

// onBarClick(monthYear: string) {
//   this.selectedMonthYear = monthYear; // e.g., "April 2021"
//   this.isTabular() == true;
// }

activeMode: 'tabular' | 'chart' = 'tabular';
openedFromChart = false;

onViewChanged(view: string) {
  this.filterState.updateViewType(view === 'Tabular' ? 'Tabular' : 'Chart');


  if (view === 'Tabular' && !this.openedFromChart) {
    // User switched manually to tabular view
    this.filterState.updateSelectedMonthYear('');
  }

  if (view === 'Chart') {
    this.openedFromChart = false;
  }
}


  onBarClick(monthYear: string): void {
    console.log('Parent received click for:', monthYear);
    this.filterState.updateSelectedMonthYear(monthYear);
    this.openedFromChart = true;
    this.filterState.updateViewType('Tabular');
  }

  switchToChart(): void {
  this.openedFromChart = false;
  this.filterState.updateViewType('Chart');
}


}

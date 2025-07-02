import { Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KENDO_DATEINPUTS } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { AuthService } from '../../service/auth.service';
import { TabStripModule } from '@progress/kendo-angular-layout';

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
    TabStripModule
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
  }

  isTabular = computed(() => this.filterState.viewType() === 'Tabular');
  selectedType = computed(() => this.filterState.dataType());

  toggleFullscreen() {
    this.fullscreenToggled.emit(!this.fullscreenMode);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}

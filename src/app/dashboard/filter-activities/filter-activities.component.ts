import { Component, Input, OnInit, SimpleChanges, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons'; 
import { DropDownListModule, DropDownsModule, MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { FilterStateService } from '../../service/filter-state.service';

@Component({
  selector: 'app-filter-activities',
  standalone: true,
  imports: [
    ButtonsModule,
    CommonModule,
    ReactiveFormsModule,
    DropDownsModule,
    MultiSelectModule,
    TooltipModule
  ],
  templateUrl: './filter-activities.component.html',
  styleUrl: './filter-activities.component.scss'
})
export class FilterActivitiesComponent implements OnInit {
  @Input() title = 'Panel Title';

  // Fullscreen mode controlled by parent component
  @Input() collapsed = false;

  // User's expand/collapse preference signal
  userExpanded = signal(true);

  constructor(public filterState: FilterStateService) {
    // Keep userExpanded = false when collapsed is true
    effect(() => {
      if (this.collapsed) {
        this.userExpanded.set(false);
      }
    }, { allowSignalWrites: true });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['collapsed']) {
      if (changes['collapsed'].currentValue) {
        // Fullscreen entered, collapse panel
        this.userExpanded.set(false);
      } else {
        // Fullscreen exited, expand panel by default
        this.userExpanded.set(true);
      }
    }
  }

  ngOnInit(): void {
    // Initialize expansion state based on collapsed input
    this.userExpanded.set(!this.collapsed);

    console.log('FILTERS:', this.filters);
    this.filters.forEach(f => {
      if (!f.control || !f.data?.length) {
        console.warn(`Missing setup for filter:`, f.label);
      }
    });
  }

  // Toggle panel expand/collapse state on user click
  togglePanel() {
    this.userExpanded.update(v => !v);
  }

  clearFilters() {
    this.filters.forEach(f => {
      f.control.setValue(f.default);
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onFilterChange(value: any, label: string) {
    console.log(`${label} changed to`, value);
  }

  getSelectedText(filter: any): string {
    const selectedValue = filter.control.value;
    const selectedItem = filter.data.find((item: any) => item.value === selectedValue);
    return selectedItem ? selectedItem.text : '';
  }

  onSelectionChnage(value: any, dropdownName: string) {
    console.log('Selection changed in:', dropdownName, value);
  }

  onSelectionChange(value: any, label: string) {
    if (label === 'View As') {
      this.filterState.updateViewType(value.value);
    } else if (label === 'Type') {
      this.filterState.updateDataType(value.value);
    }
  }

  // UI state
  activefwtab: string = 'today';
  activeTab: string = 'total';

  // Dropdown filters
  filters = [
    {
      label: 'View As',
      data: [
        { text: 'Tabular', value: 'Tabular' },
        { text: 'Chart', value: 'Chart' },
      ],
      default: { text: 'Tabular', value: 'Tabular' },
      control: new FormControl({ text: 'Tabular', value: 'Tabular' })
    },
    {
      label: 'Type',
      data: [
        { text: 'Individual', value: 'Individual' },
        { text: 'Project', value: 'Project' },
        { text: 'Office', value: 'Office' }
      ],
      default: { text: 'Individual', value: 'Individual' },
      control: new FormControl({ text: 'Individual', value: 'Individual' })
    },

  ];

  buttons = [
    { label: 'Total Documents', value: 'total', count: '1321' },
    { label: 'Backlogs', value: 'backlog', count: '16' },
    { label: 'Forecast', value: 'forecast', count: '199' },
    { label: 'Not Acknowledged', value: 'noack', count: '3' },
    { label: 'Step', value: 'step', count: '5' },
    { label: 'Rulestream', value: 'rule', count: '3' },
  ];

  fwbuttons = [
    { label: 'Today', value: 'today', subtext: '1 out of 1 are not completed' },
    { label: 'FW 6, 2025 (This Week)', value: 'thisweek', subtext: '6 out of 15 are not completed' },
    { label: 'FW 7, 2025 (Next Week)', value: 'nextweek', subtext: '4 out of 8 are not completed' },
    { label: 'FW 8, 2025', value: 'later', subtext: '4 out of 8 are not completed' },
  ];
}

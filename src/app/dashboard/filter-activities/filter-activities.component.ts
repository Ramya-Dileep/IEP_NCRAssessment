import { Component, Input, OnInit, SimpleChanges, effect, signal, ViewChild, ElementRef, HostListener, Output, EventEmitter  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons'; 
import { DropDownListModule, DropDownsModule, MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { FilterStateService } from '../../service/filter-state.service';
import { PopupModule } from '@progress/kendo-angular-popup';
import { DialogsModule } from '@progress/kendo-angular-dialog';

interface PopupItem {
  icon?: string;
  label: string;
  children?: any[]
}

@Component({
  selector: 'app-filter-activities',
  standalone: true,
  imports: [
    ButtonsModule,
    CommonModule,
    ReactiveFormsModule,
    DropDownsModule,
    MultiSelectModule,
    TooltipModule,
    PopupModule,
    DialogsModule
  ],
  templateUrl: './filter-activities.component.html',
  styleUrl: './filter-activities.component.scss'
})
export class FilterActivitiesComponent implements OnInit {
popupStyle = 'popup-wrapper open-right';
popupClass = 'popup-wrapper open-left';
@Output() viewChanged = new EventEmitter<string>();


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

        // Subscribe to value changes so programmatic changes also update view
      f.control.valueChanges.subscribe(value => {
        this.onSelectionChange(value, f.label); // simulate dropdown change
      });
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
        this.viewChanged.emit(value.value);
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

   @ViewChild('popupAnchor', { static: false }) popupAnchor!: ElementRef;

  isThreeDotClick = false;
  isInstructionsDialogVisible = false;

  savedFilters: { name: string; values: any }[] = [];

  popupItems: PopupItem[] = [
  { icon: 'save', label: 'Save Filter' },
  { icon: 'folder_open', label: 'Load Filter' }, // children dynamic
  { icon: 'help_outline', label: 'Instructions to Use' }
];

get loadFilterChildren() {
  return this.savedFilters.map(filter => ({
    label: filter.name,
    filterKey: filter.name
  }));
}


  toggleThreeDotPopup(): void {
    this.isThreeDotClick = !this.isThreeDotClick;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    if (!this.popupAnchor?.nativeElement.contains(target)) {
      this.isThreeDotClick = false;
    }
  }

  onPopupItemClick(item: PopupItem): void {
    this.isThreeDotClick = false;

    switch (item.label) {
      case 'Save Filter':
        this.saveFilter();
        break;
      case 'Load Filter':
        this.loadFilter();
        break;
      case 'Instructions to Use':
        this.showInstructionsDialog();
        break;
    }
  }

 saveFilter(): void {
  const values: any = {};
  this.filters.forEach(f => {
    const key = f.label.replace(/\s/g, ''); // Remove spaces from label for key
    values[key] = f.control.value;
  });

  const newFilter = {
    name: `Saved Filter${this.savedFilters.length + 1}`,
    values
  };
  this.savedFilters.push(newFilter);
  console.log('✅ Saved Filter:', newFilter);
}

onItemClick(item: any): void {
  const filterToApply = this.savedFilters.find(f => f.name === item.filterKey);
  if (filterToApply) {
    Object.keys(filterToApply.values).forEach(key => {
      const filter = this.filters.find(f => f.label.replace(/\s/g, '') === key);
      if (filter) {
        filter.control.setValue(filterToApply.values[key]);
      }
    });
    console.log(`Applied saved filter: ${item.filterKey}`, filterToApply.values);
  } else {
    console.warn('Saved filter not found:', item.filterKey);
  }
  this.isThreeDotClick = false; // close popup after selecting
}


  loadFilter(): void {
    if (this.savedFilters.length === 0) {
      alert('No saved filters available.');
      return;
    }
    const latest = this.savedFilters[this.savedFilters.length - 1];
    console.log('📥 Loaded Filter:', latest);
    // Apply values to your form or filter state here
  }

  showInstructionsDialog(): void {
    this.isInstructionsDialogVisible = true;
  }
}

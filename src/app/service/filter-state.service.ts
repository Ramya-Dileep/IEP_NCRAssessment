// filter-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  viewType = signal<'Tabular' | 'Chart'>('Tabular');
  dataType = signal<'Individual' | 'Project'>('Individual');
   private _selectedMonthYear = signal<string>(''); // empty by default
  selectedMonthYear = this._selectedMonthYear.asReadonly();

  updateViewType(type: 'Tabular' | 'Chart') {
    this.viewType.set(type);
  }

  updateDataType(type: 'Individual' | 'Project') {
    this.dataType.set(type);
  }

    updateSelectedMonthYear(value: string) {
    this._selectedMonthYear.set(value);
  }

  clearSelectedMonthYear() {
    this._selectedMonthYear.set('');
  }
}

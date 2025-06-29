// filter-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  viewType = signal<'Tabular' | 'Chart'>('Tabular');
  dataType = signal<'Individual' | 'Project'>('Individual');

  updateViewType(type: 'Tabular' | 'Chart') {
    this.viewType.set(type);
  }

  updateDataType(type: 'Individual' | 'Project') {
    this.dataType.set(type);
  }
}

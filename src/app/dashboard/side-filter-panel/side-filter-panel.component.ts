import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarService } from '../../service/sidebar.service';
import { ProjectTreeService, Project } from '../../service/project-tree.service';
import { ProjectTreeNode, AdvanceFilterItem } from '../../models/projectTree.model';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { AuthService } from '../../service/auth.service';
import { MultiSelectModule, KENDO_DROPDOWNS } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';


interface PopupItem {
  icon?: string;
  label: string;
  children?: PopupItem[];
}

interface UploadedFile {
  name: string;
  date: string;
}

@Component({
  selector: 'app-side-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    TreeViewModule,
    MultiSelectModule,
    FormsModule,
    KENDO_DROPDOWNS,
    DialogsModule,
    ExcelExportModule,
    PopupModule
  ],
  templateUrl: './side-filter-panel.component.html',
  styleUrls: ['./side-filter-panel.component.scss'],
})

export class SideFilterPanelComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  selectedTab: 'all' | 'my' | 'fav' = 'all';

  @Output() selectedContractsChange = new EventEmitter<string[]>();

  searchControl = new FormControl('');
  selectedJobs = new Set<string>();
  expandedNodes = new Set<string>();

  allProjects: ProjectTreeNode[] = [];
  filteredProjects: ProjectTreeNode[] = [];
  originalProjects: ProjectTreeNode[] = [];

  noDataFound = false;
  isAllSelected = false;

  isTreeExpanded = true;
  selectedJobIds: string[] = [];
  favourites = new Set<string>();

  private subscriptions: Subscription[] = [];

  // Advanced search variables
  isAdvancedSearchVisible = false;
  advanceFilterItems: AdvanceFilterItem[] = [];
  advanceFilterOptions: Record<string, string[]> = {};
  advanceSelectedValues: Record<string, string[]> = {};
  fullJobList: any;

  @ViewChild('treeWrapper') treeWrapper!: ElementRef<HTMLDivElement>;

  constructor(
    private sidebarService: SidebarService,
    private projectService: ProjectTreeService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to sidebar collapsed state
    this.subscriptions.push(
      this.sidebarService.isCollapsed$.subscribe((state) => (this.isCollapsed = state))
    );

    // Subscribe to search input changes with debounce
    this.subscriptions.push(
      this.searchControl.valueChanges.pipe(debounceTime(200)).subscribe((term) => this.applySearch(term || ''))
    );

    // Load advanced filters from API
    this.loadAdvanceFilter();
  }

  ngAfterViewInit(): void {
    // Load project tree
    this.subscriptions.push(
      this.projectService.getProjects().subscribe((projects: ProjectTreeNode[]) => {
        this.allProjects = projects;

        // Apply initial filtering based on selected tab
        this.applyTabFilter();

        // Select first project and its jobs
        this.selectFirstProjectAndJobs();

        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /** Toggle sidebar collapse */
  collapseSidebar(): void {
    this.sidebarService.setSidebarState(true);
  }

  /** Toggle the sidebar open/close */
  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  /** Toggle advanced search panel visibility and adjust tree height */
  toggleAdvancedSearch(): void {
    this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
    setTimeout(() => this.updateTreeHeight(), 0);
  }

  /** Adjust max height of tree container based on advanced search visibility */
  updateTreeHeight(): void {
    if (!this.treeWrapper) return;
    const newHeight = this.isAdvancedSearchVisible ? 200 : 400;
    this.treeWrapper.nativeElement.style.maxHeight = `${newHeight}px`;
  }

  /** Set currently selected tab and apply filters */
 setTab(tab: 'all' | 'my' | 'fav'): void {
  if (this.selectedTab === tab) return;

  this.selectedTab = tab;
  this.isAllSelected = false;

  // Debounced switch to avoid rapid re-rendering
  setTimeout(() => {
    this.applyTabFilter(); // internally calls search & select
  }, 0);
}

 /** Apply tab filtering combined with advanced filters */
applyTabFilter(): void {
  this.isAllSelected = false;
  this.applyFilter(); // Will handle tab, advanced filters, and trigger search + default selection
}


  /** Apply the text search filtering on the filtered projects */
  applySearch(term: string): void {
    const value = term.toLowerCase().trim();

    if (!value) {
      this.filteredProjects = [...this.originalProjects];
      this.noDataFound = false;
      this.selectFirstProjectAndJobs();
      return;
    }

    this.filteredProjects = this.originalProjects
      .map((project) => {
        const projectMatch = project.text.toLowerCase().includes(value);

        const filteredTrains = project.children
          ?.map((train) => {
            const matchingJobs = train.children?.filter((job) =>
              job.text.toLowerCase().includes(value)
            );

            if (train.text.toLowerCase().includes(value) || (matchingJobs && matchingJobs.length > 0)) {
              return {
                ...train,
                children: matchingJobs && matchingJobs.length > 0 ? matchingJobs : train.children,
              };
            }
            return null;
          })
          .filter((train): train is ProjectTreeNode => !!train) || [];

        if (projectMatch || filteredTrains.length > 0) {
          return {
            ...project,
            children: projectMatch ? project.children : filteredTrains,
          };
        }
        return null;
      })
      .filter((p): p is ProjectTreeNode => !!p);

    this.noDataFound = this.filteredProjects.length === 0;
    this.selectFirstProjectAndJobs();
  }

  /** Collect all job IDs recursively from projects */
  private collectAllJobIds(nodes: ProjectTreeNode[]): string[] {
    const ids: string[] = [];
    const traverse = (node: ProjectTreeNode) => {
      ids.push(node.id);
      node.children?.forEach(traverse);
    };
    nodes.forEach(traverse);
    return ids;
  }

  /** Select or deselect all jobs based on checkbox event */
  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      const allIds = this.collectAllJobIds(this.filteredProjects);
      this.selectedJobIds = allIds;
      this.selectedJobs = new Set(allIds);
      this.isAllSelected = true;
    } else {
      this.selectedJobIds = [];
      this.selectedJobs.clear();
      this.isAllSelected = false;
    }

    this.emitSelectedContracts();
    this.cdr.detectChanges();
  }

  /** Toggle tree expansion state */
  toggleTreeExpand(): void {
    this.isTreeExpanded = !this.isTreeExpanded;
  }

  /** Select first project and all its jobs (used after filtering) */
selectFirstProjectAndJobs(): void {
  if (this.selectedTab === 'fav' && this.filteredProjects.length === 0) {
    this.selectedJobs.clear();
    this.selectedJobIds = [];
    this.expandedNodes.clear();
    this.emitSelectedContracts();
    return;
  }

  this.selectedJobs.clear();
  this.selectedJobIds = [];
  this.expandedNodes.clear();

  const firstProject = this.filteredProjects[0];
  if (!firstProject) return;

  this.expandedNodes.add(firstProject.id);
  this.selectedJobs.add(firstProject.id);

  if (firstProject.children) {
    firstProject.children.forEach(train => {
      this.expandedNodes.add(train.id);
      this.selectedJobs.add(train.id);

      train.children?.forEach(job => {
        this.selectedJobs.add(job.id);
      });
    });
  }

  this.selectedJobIds = Array.from(this.selectedJobs);
  this.emitSelectedContracts();
  this.updateCurrentProjectsCheckbox();

}



public selectedKeys: any[] = ["p1"];
  tagMapper = () => [];

  /** Track if dataItem has children for TreeView */
 hasChildren = (item: object): boolean =>
    !!(item as ProjectTreeNode).children?.length;

  /** Return children as Observable for TreeView */
  children = (dataItem: any) => of(dataItem.children);

  /** Determine if node is expanded */
 isExpanded = (dataItem: any): boolean => {
    return this.expandedNodes.has(dataItem);
  };

  /** Handle changes in checked keys from the tree */
  onCheckedKeysChange(checkedKeys: string[]): void {
    this.selectedJobIds = checkedKeys;
    this.selectedJobs = new Set(checkedKeys);

    // Check if all jobs are selected to toggle 'Select All'
    const allIds = this.collectAllJobIds(this.filteredProjects);
    this.isAllSelected = allIds.length > 0 && allIds.every((id) => this.selectedJobs.has(id));

    this.emitSelectedContracts();
    this.updateCurrentProjectsCheckbox();

  }

  /** Emit the selected contracts' names */
 emitSelectedContracts(): void {
  const selectedContracts = this.allProjects
    .filter(project => {
      const hasSelectedJob = (node: ProjectTreeNode): boolean => {
        if (!node.children || node.children.length === 0) {
          return this.selectedJobs.has(node.id);
        }
        return node.children.some(child => hasSelectedJob(child));
      };
      return hasSelectedJob(project);
    })
    .map(project => project.text);

  this.selectedContractsChange.emit(selectedContracts);
  console.log("Emitted contracts:", selectedContracts);
}

  /** Count of filtered projects */
  get contractsCount(): number {
    return this.filteredProjects.length;
  }

  /** Load advanced filter options from backend */
  loadAdvanceFilter(): void {
    this.projectService.GetAdvanceFilter().subscribe((response) => {
      const data = response?.data;
      if (data && Array.isArray(data.filterItems)) {
        this.advanceFilterItems = data.filterItems;
        this.fullJobList = data.jobFullList;
        this.setupDefaultAdvanceFilters(data);
      } else {
        console.warn('Expected filterItems to be an array:', data?.filterItems);
        this.advanceFilterItems = [];
      }
    });
  }

  /** Setup default selected values for advanced filters */
  setupDefaultAdvanceFilters(responseData: any): void {
    this.advanceFilterOptions = {};
    this.advanceSelectedValues = {};

    for (const item of this.advanceFilterItems) {
      const key = item.propertyName;
      this.advanceFilterOptions[key] = responseData[key] || [];

      // Set default selected values
      if (key === 'Delivery_Year') {
        this.advanceSelectedValues[key] = ['2017'];
      } else if (key === 'Project_Type') {
        this.advanceSelectedValues[key] = ['Active', 'Planned'];
      } else {
        this.advanceSelectedValues[key] = [];
      }
    }
  }

  /** Remove last added filter for a given property */
  removeLastAddedFilter(property: string): void {
    const values = this.advanceSelectedValues[property];
    if (values?.length) {
      values.pop();
      this.advanceSelectedValues[property] = [...values];
      this.applyFilter();
    }
  }

  /** Apply advanced filters combined with tab filtering and search */
applyFilter(): void {
  const selectedValues = this.advanceSelectedValues;

  // 1️⃣ Filter jobFullList using selected values
  const matchingJobs = this.fullJobList.filter((job: any) =>
    Object.entries(selectedValues).every(([key, selected]) =>
      selected.length === 0 || selected.includes(job[key])
    )
  );

  console.log('🧩 Matching jobs:', matchingJobs);

  // If no jobs match, clear everything and exit early
  if (matchingJobs.length === 0) {
    this.filteredProjects = [];
    this.originalProjects = [];
    this.noDataFound = true;
    this.selectedJobIds = [];
    this.selectedJobs.clear();
    this.expandedNodes.clear();
    this.emitSelectedContracts();
    return;
  }

  const parentIds = new Set(matchingJobs.map((j: { parentProjectId: any; }) => j.parentProjectId));

  // 2️⃣ Get base projects by tab
  let baseProjects = this.allProjects;
  if (this.selectedTab === 'my') {
    baseProjects = baseProjects.filter((p) => p.isMyContracts === 'True');
  } else if (this.selectedTab === 'fav') {
    baseProjects = baseProjects.filter((p) => this.favourites.has(p.id));
  }

  // 3️⃣ Filter projects by matching parent project IDs
  this.filteredProjects = baseProjects.filter((p) => parentIds.has(p.id));
  this.originalProjects = [...this.filteredProjects];
  this.noDataFound = this.filteredProjects.length === 0;

  // 4️⃣ Reapply search & select first valid jobs
  this.applySearch(this.searchControl.value || '');
  this.selectFirstProjectAndJobs();
}



  /** Clear all advanced filters except the mandatory Project_Type defaults */
  clearAllFilters(): void {
    for (const key in this.advanceSelectedValues) {
      if (key === 'Project_Type') {
        this.advanceSelectedValues[key] = ['Active', 'Planned'];
      } else {
        this.advanceSelectedValues[key] = [];
      }
    }
    this.applyFilter();
  }

  /** Toggle favourite status of a project */
  toggleFavourite(project: ProjectTreeNode): void {
    if (this.favourites.has(project.id)) {
      this.favourites.delete(project.id);
    } else {
      this.favourites.add(project.id);
    }

    if (this.selectedTab === 'fav') {
      this.applyTabFilter(); // refresh if on favourites tab
    }

    this.cdr.detectChanges();
  }

  /** Check if project is favourited */
  isFavourited(dataItem: ProjectTreeNode): boolean {
    return this.favourites.has(dataItem.id);
  }



    @ViewChild('popupAnchor', { static: false }) popupAnchor!: ElementRef;

  // Popup state & display data
  isThreeDotClick = false;
  popupStyle = 'popup-wrapper open-right';
  popupClass = 'popup-wrapper open-right';


 popupItems: PopupItem[] = [
  { icon: 'grid_on', label: 'Export Contracts' },
  { icon: 'save', label: 'Save Filter' },
  {
    icon: 'folder_open',
    label: 'Load Filter',
    children: [] // dynamically added Saved Filters
  },
  { icon: 'help_outline', label: 'Instructions to Use' }
];




  uploadedFiles: UploadedFile[] = [
    { name: 'ITO - Train configuration & Opportunity Driver-Driven', date: '01-Jan-2025' },
    { name: 'ITO Information', date: '01-Jan-2025' },
    { name: 'Serial Number', date: '01-Jan-2025' },
    { name: 'Industrial segment file', date: '01-Jan-2025' },
    { name: 'P6-project creation file', date: '01-Jan-2025' },
    { name: 'Unifier project creation file', date: '01-Jan-2025' }
  ];

  savedFilters: { name: string, values: Record<string, string[]> }[] = [];  savedFilterCount = 0;
  exportData: any[] = []; // Replace with ContractExportDetail[] if needed

  // Toggle popup open/close
  toggleThreeDotPopup(): void {
    this.isThreeDotClick = !this.isThreeDotClick;
  }

  // Handle popup item click
  onPopupItemClick(item: PopupItem): void {
    console.log('Popup clicked:', item.label);
    this.isThreeDotClick = false;

    switch (item.label) {
      case 'Export Contracts':
        this.exportContracts();
        break;
      case 'Save Filter':
        this.saveFilter();
        break;
      case 'Instructions to Use':
        this.showInstructionsDialog();
        break;
      default:
        break;
    }
  }

  // Click outside to close popup
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    if (!this.popupAnchor?.nativeElement.contains(target)) {
      this.isThreeDotClick = false;
    }
  }


  saveCurrentFilter(): void {
    console.log('Saving current filter...');
    // Add save logic here
  }


saveFilter(): void {
  const newFilterName = `Saved Filter ${this.savedFilters.length + 1}`;
  const savedValues = JSON.parse(JSON.stringify(this.advanceSelectedValues));

  this.savedFilters.push({ name: newFilterName, values: savedValues });

  const loadFilterItem = this.popupItems.find(item => item.label === 'Load Filter');
  if (loadFilterItem) {
    loadFilterItem.children = this.savedFilters.map(f => ({ label: f.name }));
  }

  console.log(`✅ Saved new filter as "${newFilterName}"`, savedValues);
}


onItemClick(item: PopupItem): void {
  console.log('Loading filter:', item.label);
  const selected = this.savedFilters.find(f => f.name === item.label);
  if (selected) {
    this.advanceSelectedValues = JSON.parse(JSON.stringify(selected.values));
    this.applyFilter();
  } else {
    console.warn('No saved filter found for:', item.label);
  }
}

isCurrentProjectsSelected = false;

toggleSelectCurrentProjects(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    // Select all jobs under all filtered projects
    const allIds = this.collectAllJobIds(this.filteredProjects);
    this.selectedJobIds = allIds;
    this.selectedJobs = new Set(allIds);
    this.isCurrentProjectsSelected = true;
  } else {
    // Clear all selections
    this.selectedJobIds = [];
    this.selectedJobs.clear();
    this.isCurrentProjectsSelected = false;
  }

  this.emitSelectedContracts();
  this.cdr.detectChanges();
}

updateCurrentProjectsCheckbox(): void {
  if (this.filteredProjects.length === 0) {
    this.isCurrentProjectsSelected = false;
    return;
  }

  const allIds = this.collectAllJobIds(this.filteredProjects);

  // If only 1 project, checkbox is always checked (assuming all selected)
  if (this.filteredProjects.length === 1) {
    this.isCurrentProjectsSelected = allIds.every(id => this.selectedJobs.has(id));
  } else {
    // For multiple projects, checked only if ALL jobs are selected
    this.isCurrentProjectsSelected = allIds.length > 0 && allIds.every(id => this.selectedJobs.has(id));
  }
}

isInstructionsDialogVisible = false;

showInstructionsDialog(): void {
  this.isInstructionsDialogVisible = true;
}

@ViewChild('excelExport', { static: false }) excelExport: any;

exportColumns = [
  { field: 'parentProjectId', title: 'Contract ID' },
  { field: 'jobNumber', title: 'Contract Name' },
  { field: 'Delivery_Year', title: 'Delivery Year' },
  { field: 'RAC_Year', title: 'RAC Year' },
  { field: 'Project_Type', title: 'Project Type' },
  { field: 'Category', title: 'Category' },
  { field: 'Driver', title: 'Driver' },
  { field: 'Driven', title: 'Driven' },
  { field: 'Connector', title: 'Connector' }
];

exportContracts(): void {
  if (!this.fullJobList || this.fullJobList.length === 0) {
    console.warn('No data to export.');
    return;
  }

  // Optional: filter or prepare jobFullList if needed
  setTimeout(() => {
    this.excelExport.save();
  });
}


}

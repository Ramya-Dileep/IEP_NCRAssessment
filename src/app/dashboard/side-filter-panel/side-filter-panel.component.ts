import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Observable, of, Subscription } from 'rxjs';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Output, EventEmitter } from '@angular/core';
import { SidebarService } from '../../service/sidebar.service';
import { ProjectTreeService, Project } from '../../service/project-tree.service';
import { ProjectTreeNode, AdvanceFilterItem } from '../../models/projectTree.model';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { MultiSelectModule, KENDO_DROPDOWNS } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-side-filter-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatIconModule, TreeViewModule, MultiSelectModule, FormsModule, KENDO_DROPDOWNS],
  templateUrl: './side-filter-panel.component.html',
  styleUrl: './side-filter-panel.component.scss',
})
export class SideFilterPanelComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  selectedTab: 'all' | 'my' | 'fav' = 'all';

  @Output() selectedContractsChange = new EventEmitter<string[]>();

  searchControl = new FormControl('');
  selectedJobs = new Set<string>();
  expandedNodes = new Set<any>(); // Store expanded tree nodes (could be train or project)

  allProjects: ProjectTreeNode[] = [];
  filteredProjects: ProjectTreeNode[] = [];
  originalProjects: ProjectTreeNode[] = [];

  //  public data: any[] = [
  //       { text: 'Item 1', key: 1, children: [{text: 'Item 1.1', key: 2}, {text: 'Item 1.2', key: 3}] },
  //       { text: 'Item 2', key: 4, children: [{text: 'Item 2.1', key: 5}] },
  //       { text: 'Item 3', key: 6 },
  //   ];
    
  // checkedkeys = [1,6];

  noDataFound = false;
  isAllSelected = false;

  private subscriptions: Subscription[] = [];
  projectSubscription: Subscription[] =[];

  constructor(
    private sidebarService: SidebarService,
    private projectService: ProjectTreeService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.sidebarService.isCollapsed$.subscribe(
        (state) => (this.isCollapsed = state)
      )
    );

    this.subscriptions.push(
      this.searchControl.valueChanges
        .pipe(debounceTime(200))
        .subscribe((term) => this.applySearch(term || ''))
    );

    this.LoadAdvanceFilter();
  }

  ngAfterViewInit(): void {
     this.subscriptions.push(
     this.projectService.getProjects().subscribe((projects: ProjectTreeNode[]) => {
    this.allProjects = projects;
    this.filteredProjects = [...this.allProjects];
    this.originalProjects = [...this.filteredProjects];

    this.applyTabFilter();
    this.selectFirstProjectAndJobs();

  })
);
  }

  collapseSidebar(): void {
  this.sidebarService.setSidebarState(true); // Collapse
}



  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // ✅ Collect all job IDs recursively (or project/train/job IDs if needed)
private collectAllJobIds(nodes: ProjectTreeNode[]): string[] {
  const ids: string[] = [];

  const traverse = (node: ProjectTreeNode) => {
    ids.push(node.id); // Add this node's ID
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  };

  nodes.forEach(project => traverse(project));
  return ids;
}

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
  this.cdr.detectChanges(); // Update UI
}


isTreeExpanded = true; // default expanded

toggleTreeExpand() {
  this.isTreeExpanded = !this.isTreeExpanded;
}


  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  setTab(tab: 'all' | 'my' | 'fav'): void {
    this.selectedTab = tab;
    this.isAllSelected = false;
    this.applyTabFilter();
    this.selectFirstProjectAndJobs();
  }

applyTabFilter(): void {
  switch (this.selectedTab) {
    case 'my':
      this.filteredProjects = this.allProjects.filter(
        p => p.isMyContracts === 'True'
      );
      break;

    case 'fav':
      this.filteredProjects = this.allProjects.filter(
        p => this.favourites.has(p.id)
      );
      break;

    default:
      this.filteredProjects = [...this.allProjects];
  }

  this.originalProjects = [...this.filteredProjects];
  this.applySearch(this.searchControl.value || '');
}




  applySearch(term: string): void {
  const value = term.toLowerCase().trim();

  if (!value) {
    this.filteredProjects = [...this.originalProjects];
    this.noDataFound = false;
    this.selectFirstProjectAndJobs();
    return;
  }

  this.filteredProjects = this.originalProjects
    .map(project => {
      const projectMatch = project.text.toLowerCase().includes(value);

      const filteredTrains = project.children
        .map(train => {
          const matchingJobs = train.children.filter(job =>
            job.text.toLowerCase().includes(value)
          );

          if (train.text.toLowerCase().includes(value) || matchingJobs.length > 0) {
            return {
              ...train,
              children: matchingJobs.length > 0 ? matchingJobs : train.children,
            };
          }

          return null;
        })
        .filter((train): train is ProjectTreeNode => !!train);

      if (projectMatch || filteredTrains.length > 0) {
  return {
    ...project,
    children: projectMatch ? project.children : filteredTrains.map(train => ({
      ...train,
      children: train.children ?? []
    }))
  };
}

      return null;
    })
    .filter((p): p is ProjectTreeNode => !!p);

  this.noDataFound = this.filteredProjects.length === 0;
  this.selectFirstProjectAndJobs();
}

isFavourited(dataItem: any): boolean {
  return this.favourites.has(dataItem.id);
}


favourites = new Set<string>(); // Track favourite project IDs

toggleFavourite(project: ProjectTreeNode): void {
  if (this.favourites.has(project.id)) {
    this.favourites.delete(project.id);
  } else {
    this.favourites.add(project.id);
  }

  if (this.selectedTab === 'fav') {
    this.applyTabFilter(); // Re-apply filter if on Favourites tab
  }

  this.cdr.detectChanges();
}




// selectFirstProjectAndJobs(): void {
//   this.selectedJobs.clear();
//   this.selectedJobIds = [];
//   this.expandedNodes.clear();

//   if (this.filteredProjects.length > 0) {
//     const firstProject = this.filteredProjects[0];
//     this.expandedNodes.add(firstProject.id);

//     firstProject.children?.forEach(train => {
//       this.expandedNodes.add(train.id);
//       train.children?.forEach(job => {
//         this.selectedJobs.add(job.id);
//       });
//     });

//     this.selectedJobIds = Array.from(this.selectedJobs);
//     console.log("@@@@@", this.selectedJobIds)
//     this.emitSelectedContracts();
//     this.cdr.detectChanges();

//   }
// }





  // Kendo TreeView bindings:

selectFirstProjectAndJobs(): void {

   if (this.selectedTab === 'fav' && this.filteredProjects.length == 0) {
    this.selectedJobs.clear();
    this.selectedJobIds = [];
    this.expandedNodes.clear();
    this.emitSelectedContracts();
    this.cdr.detectChanges();
    return;
  }

  this.selectedJobs.clear();
  this.selectedJobIds = [];
  this.expandedNodes.clear();

  if (this.filteredProjects.length > 0) {
    const firstProject = this.filteredProjects[0];

    // Add project itself to expanded and selected
    this.expandedNodes.add(firstProject.id);
    this.selectedJobs.add(firstProject.id); // ✅ Add parent to selected

    firstProject.children?.forEach(train => {
      this.expandedNodes.add(train.id);
      this.selectedJobs.add(train.id); // ✅ Also add intermediate train-level

      train.children?.forEach(job => {
        this.selectedJobs.add(job.id);
      });
    });

    this.selectedJobIds = Array.from(this.selectedJobs);

    console.log("@@@@@ selectedJobIds:", this.selectedJobIds);

    this.emitSelectedContracts();
    this.cdr.detectChanges();
  }
}
 
children = (dataItem: any) => of(dataItem.children);

public selectedKeys: any[] = ["p1"];


 hasChildren = (item: object): boolean =>
    !!(item as ProjectTreeNode).children?.length;


  isExpanded = (dataItem: any): boolean => {
    return this.expandedNodes.has(dataItem);
  };


selectedJobIds: string[] = ["0"];

onCheckedKeysChange(checkedKeys: string[]): void {
  this.selectedJobIds = checkedKeys;
  this.selectedJobs = new Set(checkedKeys);
  console.log("*******",this.selectedJobIds )

  // 🧠 Determine if all job IDs are selected
  const allIds = this.collectAllJobIds(this.filteredProjects);
  this.isAllSelected = allIds.length > 0 && allIds.every(id => this.selectedJobs.has(id));

  this.emitSelectedContracts();

}

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



// emitSelectedContracts(): void {
//   const selectedContracts = this.filteredProjects
//     .filter(project => {
//       const hasSelectedJob = (node: ProjectTreeNode): boolean => {
//         if (!node.children || node.children.length === 0) {
//           return this.selectedJobs.has(node.id);
//         }
//         return node.children.some(child => hasSelectedJob(child));
//       };
//       return hasSelectedJob(project);
//     })
//     .map(project => project.text);

//   this.selectedContractsChange.emit(selectedContracts);
//   console.log("Emitted contracts:", selectedContracts);
// }


  get contractsCount(): number {
    return this.filteredProjects.length;
  }


 // variables for Advance Search
  isAdvancedSearchVisible = false;
  advanceSearchToggle : boolean = true;
  advanceFilterItems:AdvanceFilterItem[] = []; // from API
  advanceFilterOptions: Record<string, string[]> = {}; // propertyName => array
  advanceSelectedValues: Record<string, string[]> = {}; // propertyName => selected items
  fullJobList : any;
  tagMapper = () => [];
 
LoadAdvanceFilter() {
  this.projectService.GetAdvanceFilter().subscribe(response => {
    const data = response?.data;

    if (data && Array.isArray(data.filterItems)) {
      this.advanceFilterItems = data.filterItems;
      this.fullJobList = data.jobFullList;
      this.CheckDefaultAdvanceFilters(data);
    } else {
      console.warn('Expected filterItems to be an array:', data?.filterItems);
      this.advanceFilterItems = [];
    }
  });
}


 
  // LoadAdvanceFilter()
  // {
  //   this.projectService.GetAdvanceFilter().subscribe(data => {
  //     this.advanceFilterItems = data.filterItems;
  //     this.fullJobList = data.jobFullList;
  //     this.CheckDefaultAdvanceFilters(data);
  //   });
  // }

  CheckDefaultAdvanceFilters(responseData: any) {
  if (!Array.isArray(this.advanceFilterItems)) {
    console.error('advanceFilterItems is not an array:', this.advanceFilterItems);
    return;
  }

  for (let item of this.advanceFilterItems) {
    const key = item.propertyName;
    this.advanceFilterOptions[key] = responseData[key] || [];
 if (key === 'Delivery_Year') {
      this.advanceSelectedValues[key] = ["2017"];
    } else if (key === 'Project_Type') {
      this.advanceSelectedValues[key] = ["Active", "Planned"];
    } else {
      this.advanceSelectedValues[key] = [];
    }
  }
}

 
  // CheckDefaultAdvanceFilters(responseData : any)
  // {
  //     // Iterate filter values
  //     for (let item of this.advanceFilterItems) {
  //       const key = item.propertyName;
  //       this.advanceFilterOptions[key] = responseData[key] || [];
  //     // 👇 Default selection for Project_Type
  //     if (key === 'businessTier1') {
  //       this.advanceSelectedValues[key] = ["New Units", "PVS - Upgrades"];
  //     }
  //     else if (key === 'Delivery_Date') {
  //       this.advanceSelectedValues[key] = ["12/21/2017"];
  //     }
  //      else if (key === 'Project_Type') {
  //       this.advanceSelectedValues[key] = ["Active","Planned"];
  //     }  
  //     else {
  //       this.advanceSelectedValues[key] = [];
  //     }
  //     }
  // }
 
// Removes last selected value for a given key
  removeLastAddedFilter(property: string) {
    const values = this.advanceSelectedValues[property];
    if (values?.length)
    {
      values.pop();
      this.advanceSelectedValues[property] = [...values];
      this.applyFilter();
    }
  }

  applyFilter(): void {
  this.applyTabFilter(); // optional if needed to combine filters

  const matchesAdvancedFilter = (project: ProjectTreeNode): boolean => {
    for (const [key, selectedValues] of Object.entries(this.advanceSelectedValues)) {
      if (selectedValues.length === 0) continue;

      const projectValue = (project as any)[key];
      if (!selectedValues.includes(projectValue)) return false;
    }
    return true;
  };

  this.filteredProjects = this.filteredProjects.filter(matchesAdvancedFilter);
  this.originalProjects = [...this.filteredProjects];
  this.applySearch(this.searchControl.value || '');
  this.selectFirstProjectAndJobs();
}

 
  clearAllFilters() {
    for (let key in this.advanceSelectedValues) {
      // Do not clear Active and Planned Project Types as its a must checked item always
      if (key === 'Project_Type') {
        this.advanceSelectedValues[key] = ["Active", "Planned"];
      }
      else {
        this.advanceSelectedValues[key] = [];
      }
    }
  }

}

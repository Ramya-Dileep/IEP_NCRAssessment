
// Top-level node with meta info
export interface ProjectTreeNode {
  id: string;
  text: string;
  isMyContracts?: string;
  isFavourite?: string;
  children: ProjectTreeNode[];
}

export interface AdvanceFilterItem {
  filterName: string;
  propertyName: string;
}

  
  
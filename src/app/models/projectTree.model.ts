// export interface ProjectTreeNode {
//     projectName: string;
//     trains: {
//       trainName: string;
//       jobNumbers: string[];
//     }[];
//     meta?: {
//       isMyContract: boolean;
//       isFavourite: boolean;
//     };
//   }


// Top-level node with meta info
export interface ProjectTreeNode {
  id: string;
  text: string;
  isMyContracts?: string;
  isFavourite?: string;
  children: ProjectTreeNode[];
}

  
  
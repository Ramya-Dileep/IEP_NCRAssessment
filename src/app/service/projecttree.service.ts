import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export interface Project {
  projectId: string;
  contractName: string;
  projectStatus: string;
  isMyContracts: string;
  isFavourite: string;
  trains: {
    trainId: string;
    trainName: string;
    jobNumber: string[];
  }[];
}

export class ProjectService {

  private projects: Project[] =[
    {
      projectId: 'p1',
      contractName: 'Phoenix GTG',
      projectStatus: 'Active',
      isMyContracts: 'True',
      isFavourite: 'False',
      trains: [
        { trainId: 't1', trainName: 'Phoenix-1', jobNumber: ['PHX-1001', 'PHX-1002'] },
        { trainId: 't2', trainName: 'Phoenix-2', jobNumber: ['PHX-1003'] }
      ]
    },
    {
      projectId: 'p2',
      contractName: 'Orion Gas Plant',
      projectStatus: 'Active',
      isMyContracts: 'False',
      isFavourite: 'True',
      trains: [
        { trainId: 't3', trainName: 'Orion-A', jobNumber: ['ORN-2001'] },
        { trainId: 't4', trainName: 'Orion-B', jobNumber: ['ORN-2002'] }
      ]
    },
    {
      projectId: 'p3',
      contractName: 'Nova Hydrogen GTG',
      projectStatus: 'Active',
      isMyContracts: 'True',
      isFavourite: 'True',
      trains: [
        { trainId: 't5', trainName: 'Nova-T1', jobNumber: ['NVA-3001', 'NVA-3002'] }
      ]
    }
  ];

  constructor() {}

  // Return all projects as Observable
  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  // Filtered projects for My Contracts
  getMyContracts(): Observable<Project[]> {
    return of(this.projects.filter(p => p.isMyContracts === 'True'));
  }

  // Filtered projects for Favourites
  getFavourites(): Observable<Project[]> {
    return of(this.projects.filter(p => p.isFavourite === 'True'));
  }
}

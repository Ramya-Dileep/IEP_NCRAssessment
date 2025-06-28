import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';


// export interface Project {
//   projectId: string;
//   contractName: string;
//   projectStatus: string;
//   isMyContracts: string;
//   isFavourite: string;
//   trains: {
//     trainId: string;
//     trainName: string;
//     jobNumber: string[];
//   }[];
// }

export interface Project {
  id: string;
  text: string;
  isMyContract: string;
  isFavourite: string;
  
  children: Project[]; // recursive children (trains or jobs)
}

@Injectable({
  providedIn: 'root'
})


export class ProjectTreeService {


  // commented for backend implementation
  // private readonly dataUrl = 'assets/JSON/projecttreedata.json';

   private readonly dataUrl = 'http://localhost:5000/api/projects';

  private projects : Project[] =[];
   
  constructor(private http: HttpClient) {}  

    getProjects(): Observable<Project[]> {
      // return of(this.projects);
        return this.http.get<Project[]>(this.dataUrl);
    }
  
    getMyContracts(): Observable<Project[]> {
      return of(this.projects.filter(p => p.isMyContract === 'True'));
    }
  
    getFavourites(): Observable<Project[]> {
      return of(this.projects.filter(p => p.isFavourite === 'True'));
    }
}

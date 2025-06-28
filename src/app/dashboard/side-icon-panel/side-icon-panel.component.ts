import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {SidebarService} from '../../service/sidebar.service'

@Component({
  selector: 'app-side-icon-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './side-icon-panel.component.html',
  styleUrl: './side-icon-panel.component.scss'
})
export class SideIconPanelComponent {
  navItems = [
    { id: 1, label: 'dashboard', icon: 'device_hub', routerLink: '/dasahboard'},
    { id: 7, label: 'Apps', icon: 'apps', routerLink: '/apps' },
    { id: 6, label: 'FolderManaged', icon:'folder_managed', routerLink: '/managefolders' },
    { id: 4, label: 'Folder', icon: 'folder', routerLink: '/folders' },
    { id: 5, label: 'addFolder', icon: 'verified', routerLink: '/folders' },
    { id:2, label: 'Settings', icon: 'settings', routerLink: '/settings' },
    { id: 3, label: 'Profile', icon: 'engineering', routerLink: '/profile' },

  ];
  selectedId : number = 2;
  i: any;

  constructor(private sidebarService:SidebarService){}

 expandSidebar(i : any): void {
  if(i=== 0){
    this.sidebarService.setSidebarState(false); // Expand
  }
  }

}

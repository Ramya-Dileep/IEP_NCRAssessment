import { Component, ChangeDetectorRef, AfterViewInit, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./header/header.component";
import { SideIconPanelComponent } from "./side-icon-panel/side-icon-panel.component";
import { SideFilterPanelComponent } from "./side-filter-panel/side-filter-panel.component";
import { MaincontentHeaderComponent } from './maincontent-header/maincontent-header.component';
import { SidebarService } from '../service/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SideIconPanelComponent,
    SideFilterPanelComponent,
    MaincontentHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  toolName: string = 'OTR';
  isSidebarCollapsed = false;
  isFullscreen = false;

  selectedContracts: string[] = [];
  SelectedContractsForMain: string = '';

  private collapseSubscription: Subscription = new Subscription();

  constructor(
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.collapseSubscription = this.sidebarService.isCollapsed$.subscribe(
      (state) => {
        this.zone.run(() => {
          this.isSidebarCollapsed = state;
        });
      }
    );
  }

  ngAfterViewInit(): void {
    this.SelectedContractsForMain = this.selectedContracts.join(', ');
    this.cdr.detectChanges();
  }

  onContractsChanged(contracts: string[]): void {
    this.selectedContracts = contracts;
    this.SelectedContractsForMain = this.selectedContracts.join(', ');
  }

  onFullscreenToggle(fullscreen: boolean): void {
    this.isFullscreen = fullscreen;
  }

  ngOnDestroy(): void {
    if (this.collapseSubscription) {
      this.collapseSubscription.unsubscribe();
    }
  }
}

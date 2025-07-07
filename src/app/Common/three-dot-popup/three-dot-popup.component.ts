import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { PopupModule } from '@progress/kendo-angular-popup';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-three-dot-popup',
  standalone: true,
  imports: [PopupModule, CommonModule],
  templateUrl: './three-dot-popup.component.html',
  styleUrl: './three-dot-popup.component.scss'
})
export class ThreeDotPopupComponent {
  @Input() popupItems: any[] = [];
  @Input() uploadedFiles: any[] = [];
  @Input() popupClass = 'popup-style';
  @Input() anchorRef!: ElementRef<HTMLElement>;

  @Output() itemClicked = new EventEmitter<any>();
  @Output() subItemClicked = new EventEmitter<any>();

  activeItemWithChildren: any = null;

  constructor(private elRef: ElementRef) {}

  onItemClick(item: any): void {
    if (!item.children?.length) {
      this.itemClicked.emit(item);
    } else {
      this.activeItemWithChildren = item;
    }
  }

  onChildClick(child: any): void {
    this.subItemClicked.emit(child);
    this.activeItemWithChildren = null;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const popupClicked = this.elRef.nativeElement.contains(event.target as Node);
    const anchorClicked = this.anchorRef?.nativeElement.contains(event.target as Node);

    if (!popupClicked && !anchorClicked) {
      this.itemClicked.emit(null); // signal to close
    }
  }
}



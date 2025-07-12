import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ChartComponent, KENDO_CHARTS, SeriesType } from '@progress/kendo-angular-charts';
import { PageChangeEvent, PagerType } from '@progress/kendo-angular-grid';
import { KENDO_PAGER } from '@progress/kendo-angular-pager';
import { ChartdataService } from '../../service/chartdata.service';

interface ChartItem {
  year: number;
  month: string;
  count: number;
}

interface ContractChart {
  contract: string;
  chartData: ChartItem[];
}

@Component({
  selector: 'app-activities-chart',
  standalone: true,
  imports: [KENDO_CHARTS, KENDO_PAGER],
  templateUrl: './activities-chart.component.html',
  styleUrl: './activities-chart.component.scss'
})
export class ActivitiesChartComponent {
  @Output() barClicked = new EventEmitter<string>();
  @Input() SelectedContracts: string[] = [];
  @Input() type: string = '';

  public categories: string[] = [];
  public counts: number[] = [];
  chartData: ChartItem[] = [];

  // chartData: ChartItem[] = [
  //   { year: 2023, month: 'January', count: 10 },
  //   { year: 2023, month: 'February', count: 15 },
  //   { year: 2023, month: 'March', count: 8 },
  //     { year: 2023, month: 'April', count: 10 },
  //   { year: 2023, month: 'May', count: 15 },
  //   { year: 2023, month: 'June', count: 8 },
  //   // Add as many as you want
  // ];

 constructor(private chartService: ChartdataService) {}


  fetchChartData(): void {
    this.chartService.getChartdata().subscribe((data: ChartItem[]) => {
      this.chartData = data;
      this.updatePageData(); // prepare the chart with paginated data
    });
  }
  
ngOnInit(): void {
  this.loadChartData(); // only this
}

// new code changes

ngOnChanges(changes: SimpleChanges): void {
  if (changes['type'] || changes['SelectedContracts']) {
    this.loadChartData();
  }
}


loadChartData(): void {
   const data$ = this.type === 'Project'
    ? this.chartService.getPojectChartdata()
    : this.chartService.getChartdata();

     data$.subscribe((data: ContractChart[]) => {
    console.log('All data:', data);
    console.log('SelectedContracts:', this.SelectedContracts);

    if (!this.SelectedContracts?.length) {
      this.chartData = [];
    } else {
      const matched = data.filter(item =>
        this.SelectedContracts.includes(item.contract)
      );

      console.log('Matched data:', matched);

      this.chartData = matched.flatMap(item => item.chartData);
    }

    this.prepareChartData();
    this.currentPage = 0;
    this.updatePageData();
  });
}



// commenting for implementing selected contract change with chart data

// ngOnChanges(changes: SimpleChanges): void {
//   if (changes['type'] && !changes['type'].firstChange) {
//     console.log("type", this.type)
//     this.loadChartData(); // reload based on updated input
//   }
// }

// loadChartData(): void {
//   const data$ = this.type === 'Project'
//     ? this.chartService.getPojectChartdata()
//     : this.chartService.getChartdata();

//   data$.subscribe((data: ChartItem[]) => {
//     this.chartData = data;
//     this.prepareChartData();  // optional sorting
//     this.currentPage = 0;     // reset pager
//     this.updatePageData();    // slice for page
//   });
// }


//  ngOnInit(): void {

//     this.fetchChartData();

//     // This handles initial load
//     if (this.chartData?.length) {
//       this.prepareChartData();
//       this.updatePageData(); 
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     // This handles future changes to @Input() chartData
//     if (changes['chartData'] && changes['chartData'].currentValue?.length > 0) {
//       this.prepareChartData();
//     }
//   }

  private prepareChartData(): void {
    const monthOrder: { [month: string]: number } = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };

    this.chartData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrder[a.month] - monthOrder[b.month];
    });

    this.categories = this.chartData.map(d => `${d.month} ${d.year}`);
    this.counts = this.chartData.map(d => d.count);
  }

  onBarClick(e: any): void {
     console.log('Bar clicked:', e);
    this.barClicked.emit(e.category);
  }

// In your component class

// How many bars per page
pageSize = 5; 

// Current skip count (items to skip)
currentPage = 0; // kendo-pager expects skip, so initialize at 0

// Optional: page size options for user to select from
pageSizes = [5, 10, 20]; 

// Whether to show info text ("Page 1 of N")
info = false; 

// Show previous/next buttons
prevNext = true;

// Pager type, e.g., numeric or input (optional)
Pagetype: PagerType = "numeric"; // or 'input', 'numeric', etc.

// contentId for aria-controls - optional for accessibility
contentId = 'chartContent'; // your chart container id

// When the user changes page or page size
onPageChange(event: { skip: number; take: number }) {
  this.currentPage = event.skip;  // skip is number of items to skip (e.g., 0, 5, 10, ...)
  this.pageSize = event.take;     // take is page size
  this.updatePageData();
}

updatePageData() {
  // Calculate start and end indexes of the current page slice
  const start = this.currentPage;
  const end = start + this.pageSize;

  // Slice your main chartData to the page subset
  const pageData = this.chartData.slice(start, end);

  // Update categories and counts arrays used by the chart
  this.categories = pageData.map(d => `${d.month} ${d.year}`);
  this.counts = pageData.map(d => d.count);
}

// Make sure to call updatePageData() whenever chartData input changes or onInit


}

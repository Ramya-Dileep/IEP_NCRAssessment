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
  skip = 0; // This is the same as currentPage, needed for binding with <kendo-pager>


  constructor(private chartService: ChartdataService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

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

      if (!this.SelectedContracts?.length) {
        this.chartData = [];
      } else {
        const matched = data.filter(item =>
          this.SelectedContracts.includes(item.contract)
        );

        this.chartData = matched.flatMap(item => item.chartData);
      }

      this.prepareChartData();
      this.currentPage = 0;
      this.updatePageData();
    });
  }

  private prepareChartData(): void {
    const monthOrder: { [month: string]: number } = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };

    this.chartData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrder[a.month] - monthOrder[b.month];
    });
  }

  onBarClick(e: any): void {
    this.barClicked.emit(e.category);
  }

  // Paging controls
  pageSize = 5;
  currentPage = 0;
  pageSizes = [5, 10, 20];
  info = false;
  prevNext = true;
  Pagetype: PagerType = 'numeric';
  contentId = 'chartContent';

  onPageChange(event: { skip: number; take: number }) {
    this.currentPage = event.skip;
    this.pageSize = event.take;
    this.updatePageData();
  }

  updatePageData() {
    const start = this.currentPage;
    const end = start + this.pageSize;
    const pageData = this.chartData.slice(start, end);
    this.categories = pageData.map(d => `${d.month} ${d.year}`);
    this.counts = pageData.map(d => d.count);
  }
}

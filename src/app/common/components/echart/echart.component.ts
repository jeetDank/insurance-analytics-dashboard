

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-echarts',
  template: `<div #chartContainer class="echart-host"></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .echart-host {
        width: 100%;
        height: 100%;
      }
    `
  ]
})
export class EchartsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  /** Full ECharts option object */
  @Input() options: echarts.EChartsOption = {};

  /** Theme name or object */
  @Input() theme?: string | object;

  /** Merge or replace */
  @Input() notMerge = false;

  /** Auto resize chart on container resize */
  @Input() autoResize = true;

  /** Emit chart instance after init */
  @Output() chartInit = new EventEmitter<echarts.ECharts>();

  private chartInstance?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initChart();
    if (this.autoResize && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.ngZone.runOutsideAngular(() => {
          this.chartInstance?.resize();
        });
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.chartInstance) {
      this.ngZone.runOutsideAngular(() => {
        this.chartInstance?.setOption(this.options, { notMerge: this.notMerge });
      });
    }
  }

  private initChart(): void {
    this.ngZone.runOutsideAngular(() => {
      this.chartInstance = echarts.init(this.chartContainer.nativeElement, this.theme || undefined);
      this.chartInstance.setOption(this.options, { notMerge: this.notMerge });
    });
    this.chartInit.emit(this.chartInstance!);
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = undefined;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }
}

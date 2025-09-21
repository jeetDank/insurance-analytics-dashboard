import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-simple-metric-card',
  imports: [CommonModule],
  templateUrl: './simple-metric-card.component.html',
  styleUrl: './simple-metric-card.component.scss'
})
export class SimpleMetricCardComponent {

  @Input() trend:number = 0;
  @Input() value:string = "0%"; 
  @Input() title:string ="Trend Title";
 
}

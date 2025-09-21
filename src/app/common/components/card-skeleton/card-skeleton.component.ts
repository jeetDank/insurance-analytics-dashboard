import { Component } from '@angular/core';
import {SkeletonModule} from 'primeng/skeleton'

@Component({
  selector: 'app-card-skeleton',
  imports: [SkeletonModule],
  templateUrl: './card-skeleton.component.html',
  styleUrl: './card-skeleton.component.scss'
})
export class CardSkeletonComponent {

}

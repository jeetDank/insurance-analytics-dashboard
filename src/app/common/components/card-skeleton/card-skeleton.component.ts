import { Component } from '@angular/core';
import {SkeletonModule} from 'primeng/skeleton'
import { LoaderService } from '../../services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-skeleton',
  imports: [SkeletonModule,CommonModule],
  templateUrl: './card-skeleton.component.html',
  styleUrl: './card-skeleton.component.scss'
})
export class CardSkeletonComponent {

  isVisible:any;
  constructor(private loaderService:LoaderService){
     this.loaderService.isLoading.subscribe((val)=>{
      this.isVisible = val;
    });
  }

}

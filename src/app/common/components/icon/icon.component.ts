import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-icon',
  standalone:false,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() name: string = 'Home';   // must match the Feather icon name you picked
  @Input() size: number = 24;       // default size (px)
  @Input() color: string = '#000';  // defau

}

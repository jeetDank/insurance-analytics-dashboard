import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-custom-message',
imports: [CommonModule, MessageModule],
  templateUrl: './custom-message.component.html',
  styleUrl: './custom-message.component.scss'
})
export class CustomMessageComponent {

  @Input() icon: any = null;
  @Input() title: any  = '';
  @Input() body: any = [];
  @Input() severity: 'success' | 'info' | 'warn' | 'error' | any = 'info';
  // @Input() life: number = 3000;
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

}

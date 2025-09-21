import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IconsModule } from '../../common/components/icon/icons.module';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
 imports: [CommonModule, FormsModule, NgbAlertModule, IconsModule,ButtonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    this.errorMessage = null;
    console.log('Logging in with', this.email, this.password);
    // TODO: connect to real auth service
  }

  constructor(private router:Router){

  }

  redirectToFeatures(){
    this.router.navigate(["/features"])
  }
}

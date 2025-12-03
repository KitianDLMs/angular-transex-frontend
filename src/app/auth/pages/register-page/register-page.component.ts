import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent { 
  currentYear = new Date().getFullYear();

}

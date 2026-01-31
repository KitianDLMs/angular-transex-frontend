import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ IMPORTANTE
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-admin-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,      // ✅ habilita *ngIf, *ngFor
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-dashboard-layout.component.html',
})
export class AdminDashboardLayoutComponent {
  authService = inject(AuthService);
  menuOpen = false;
  
  constructor(
    private router: Router,
  ) { }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  user = computed(() => this.authService.user());

  volver() {
    this.router.navigateByUrl('/store-front');
  }
}

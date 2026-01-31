import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '@shared/interfaces/user.interface';

@Component({
  selector: 'users-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users-table.component.html',
})
export class UsersTableComponent {

  @Input() users: User[] | null = null;

  constructor(private router: Router) {}

  trackByUserId(_: number, user: User) {
    return user.id;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'user':
        return 'bg-green-600';

      case 'admin':
        return 'bg-red-600';

      case 'super-user':
        return 'bg-yellow-500 text-black';

      default:
        return 'bg-gray-400';
    }
  }
}

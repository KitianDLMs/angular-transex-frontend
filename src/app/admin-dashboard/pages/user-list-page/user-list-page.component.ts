import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersTableComponent } from '@dashboard/users/components/users-table.component';
import { RouterModule } from '@angular/router';
import { UserService } from '@dashboard/users/services/user.service';
import { User } from '@shared/interfaces/user.interface';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, UsersTableComponent],
  templateUrl: './user-list-page.component.html',
})
export class UserListPageComponent implements OnInit {

  private userService = inject(UserService);

  users: User[] = [];

  page = 1;
  limit = 10;
  totalUsers = 0;
  totalPages = 1;
  pages: number[] = [];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 1) {
    this.loading = true;

    this.userService.getPaginatedUsers(page, this.limit).subscribe({
      next: (resp) => {
        this.users = resp.data;
        this.totalUsers = resp.totalItems;
        this.page = resp.page;
        this.limit = resp.limit;          
        this.totalPages = resp.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      },
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.loadUsers(page);
  }
}

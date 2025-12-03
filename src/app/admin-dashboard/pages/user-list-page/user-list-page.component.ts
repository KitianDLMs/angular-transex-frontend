import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@dashboard/users/services/user.service';
import { UsersTableComponent } from '@dashboard/users/components/users-table.component';
import { RouterModule } from '@angular/router';
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
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (resp) => {
        this.users = resp;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        console.error(err);
        this.loading = false;
      }
    });
  }
}

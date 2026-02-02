import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-circle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-36 h-36">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <!-- Fondo -->
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="3"
        />

        <!-- Progreso -->
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          stroke="#0ea5e9"
          stroke-width="3"
          stroke-linecap="round"
          [attr.stroke-dasharray]="percentage + ', 100'"
        />
      </svg>

      <!-- Texto central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <p class="text-sm font-semibold text-cyan-700">
          {{ current }} / {{ total }} m³
        </p>
        <p class="text-xs text-gray-400">
          {{ percentage | number:'1.0-0' }}%
        </p>
      </div>
    </div>
  `
})
export class ProgressCircleComponent {

  @Input() current = 0;
  @Input() total = 0;

  get percentage(): number {
    return this.total > 0 ? (this.current / this.total) * 100 : 0;
  }
}

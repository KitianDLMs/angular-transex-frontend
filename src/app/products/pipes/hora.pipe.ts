import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hora'
})
export class HoraPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '--';

    // Forzar UTC agregando Z
    const date = new Date(value + 'Z');

    if (isNaN(date.getTime())) return '--';

    return date.toISOString().substring(11, 16); // HH:mm
  }
}

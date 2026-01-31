import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[rutFormat]',
  standalone: true,
})
export class RutFormatDirective {

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput() {
    let value = this.el.nativeElement.value;

    // 🔒 elimina TODO lo que no sea número, K o guion
    value = value.replace(/[^0-9kK-]/g, '');

    // 🔒 solo un guion
    const parts = value.split('-');
    if (parts.length > 2) {
      value = parts[0] + '-' + parts[1];
    }

    // 🔒 máximo 8 dígitos + guion + DV
    if (parts[0].length > 8) {
      parts[0] = parts[0].slice(0, 8);
      value = parts.join('-');
    }

    if (parts[1]?.length > 1) {
      parts[1] = parts[1].slice(0, 1);
      value = parts.join('-');
    }

    this.el.nativeElement.value = value.toUpperCase();
  }

  // 🔒 BLOQUEA TECLAS INVÁLIDAS
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete'
    ];

    if (allowedKeys.includes(event.key)) return;

    if (!/[0-9kK-]/.test(event.key)) {
      event.preventDefault();
    }
  }

  // 🔒 BLOQUEA PEGADO INVÁLIDO
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const clean = text.replace(/[^0-9kK-]/g, '').slice(0, 10);
    this.el.nativeElement.value = clean.toUpperCase();
  }
}

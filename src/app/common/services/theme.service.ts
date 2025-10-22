import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
 private themeLink: HTMLLinkElement | null = null;

  constructor() {
    this.createThemeLink();
  }

  private createThemeLink(): void {
    // Check if link already exists
    this.themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    
    if (!this.themeLink) {
      // Create new link element
      this.themeLink = document.createElement('link');
      this.themeLink.id = 'app-theme';
      this.themeLink.rel = 'stylesheet';
      document.head.appendChild(this.themeLink);
    }
  }

  switchTheme(theme: string): void {
    if (this.themeLink) {
      // Use the assets path (configured in angular.json)
      this.themeLink.href = `assets/themes/${theme}/theme.css`;
      localStorage.setItem('theme', theme);
    }
  }

  loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.switchTheme(savedTheme);
    } else {
      // Default to dark theme
      this.switchTheme('aura-dark-blue');
    }
  }
}

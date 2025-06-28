import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { NoReuseStrategy } from './Common/no-reuse.strategy';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(), 
             provideAnimations(), { provide: RouteReuseStrategy, useClass: NoReuseStrategy }, provideAnimationsAsync('noop')]
};



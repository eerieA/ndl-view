import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'crypto/:code',
    renderMode: RenderMode.Client, // Prevent prerendering for dynamic route
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

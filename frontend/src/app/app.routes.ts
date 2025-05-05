import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CryptoDetailComponent } from './pages/crypto-detail/crypto-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'crypto/:code', component: CryptoDetailComponent },
];
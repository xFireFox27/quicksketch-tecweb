import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; 
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Gallery } from './pages/gallery/gallery';
import { Draw } from './pages/draw/draw';
import { Play } from './pages/play/play';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { Profile } from './pages/profile/profile';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'gallery', component: Gallery },
  { path: 'leaderboard', component: Leaderboard },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'draw', component: Draw, canActivate: [AuthGuard] },
  { path: 'play/:id', component: Play }, 
  { path: '**', redirectTo: '' } 
];
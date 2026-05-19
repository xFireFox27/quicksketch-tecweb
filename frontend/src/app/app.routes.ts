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
  { path: '', component: Home, title: 'QuickSketch - Home' },
  { path: 'login', component: Login, title: 'QuickSketch - Login' },
  { path: 'register', component: Register, title: 'QuickSketch - Register' },
  { path: 'gallery', component: Gallery, title: 'QuickSketch - Gallery' },
  { path: 'leaderboard', component: Leaderboard, title: 'QuickSketch - Leaderboard' },
  { path: 'profile', component: Profile, canActivate: [AuthGuard], title: 'QuickSketch - Profile' },
  { path: 'draw', component: Draw, canActivate: [AuthGuard], title: 'QuickSketch - Draw' },
  { path: 'play/:id', component: Play, title: 'QuickSketch - Play' }, 
  { path: '**', redirectTo: '' } 
];
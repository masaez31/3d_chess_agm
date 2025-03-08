import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/chess',
    pathMatch: 'full',
  },
  {
    path: 'chess',
    loadChildren: () => import('./chess-board/chess-board.module').then(m => m.ChessBoardModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

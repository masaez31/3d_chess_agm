import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessBoardComponent } from './chess-board/chess-board.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',  // Empty path means it will load when the module is accessed directly via /chess
    component: ChessBoardComponent,
  },
];

@NgModule({
  declarations: [
    ChessBoardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ChessBoardModule { 
  constructor(){
    console.log("HOLA2")
  }
}

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { PlayerSelectComponent } from './player-select/player-select.component';
import { MatchSelectComponent } from './match-select/match-select.component';
import { MainSessionComponent } from './main-session/main-session.component';
import { MatchService } from '../services/match.service';
import { RecordedSessionComponent } from './recorded-session/recorded-session.component';

import { IonicStorageModule } from '@ionic/storage';
import { SetDetailsComponent } from './set-details/set-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicStorageModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
        children: [{
          path: 'player-select/:matchId',
          component: PlayerSelectComponent
        }, {
          path: 'match-select',
          component: MatchSelectComponent
        }, {
          path: 'set-details/:matchId',
          component: SetDetailsComponent
        }, {
          path: 'main-session/:matchId',
          component: MainSessionComponent
        }, {
          path: 'recorded-session/:matchId',
          component: RecordedSessionComponent
        }, {
          path: '',
          redirectTo: 'match-select',
          pathMatch: 'full'
        }]
      }
    ])
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    HomePage,
    MatchSelectComponent,
    PlayerSelectComponent,
    SetDetailsComponent,
    MainSessionComponent,
    RecordedSessionComponent
  ],
  providers: [ MatchService ]
})
export class HomePageModule {}

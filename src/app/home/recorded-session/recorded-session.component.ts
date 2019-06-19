import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from 'src/app/services/match.service';
import { Subscription } from 'rxjs';
import { ISession, IAction } from 'src/app/interfaces/match.interface';

@Component({
  selector: 'app-recorded-session',
  templateUrl: './recorded-session.component.html',
  styleUrls: ['./recorded-session.component.scss'],
})
export class RecordedSessionComponent implements OnInit, OnDestroy {
  selectedMatch: string;
  sessionDetails: ISession;
  routeSubscription: Subscription;
  sessionArray: any[] = [];
  constructor(private route: ActivatedRoute, private matchService: MatchService) { }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe((data) => {
      this.selectedMatch = data['matchId'];
      this.getData();
    })
  }

  async getData() {
    if(this.selectedMatch) {
      const identifiedDetails = await this.matchService.getFromStorage(this.selectedMatch);
      console.log(identifiedDetails[this.selectedMatch].session);
      this.sessionDetails = identifiedDetails[this.selectedMatch].session;
      this.sessionArray = Object.keys(this.sessionDetails).map((sessionKey) => {
        return this.sessionDetails[sessionKey];
      })
      console.log(this.sessionArray);
    }
    
  }

  exportData() {
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatchService } from 'src/app/services/match.service';
import { IPlayerDetails, IToss } from 'src/app/interfaces/match.interface';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-set-details',
  templateUrl: './set-details.component.html',
  styleUrls: ['./set-details.component.scss'],
})
export class SetDetailsComponent implements OnInit, OnDestroy {
  playersList: IPlayerDetails[] = [];
  selectedMatch: string;
  routeSubscription:  Subscription;
  selectedPlayer: string;
  selectedAction: string;
  numberOfSets: string;
  setPoints: string;
  tossDetails: IToss;

  constructor(private matchService: MatchService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe((data) => {
      this.selectedMatch = data.matchId;
      this.intializeDetails();
    });
  }

  intializeDetails() {
    this.playersList = this.matchService.matchDetails[this.selectedMatch].players;
  }

  saveTossDetails() {
    this.tossDetails = {
      choosenAction: this.selectedAction,
      numberOfSets: this.numberOfSets,
      setPoints: this.setPoints,
      wonby: this.selectedPlayer
    };
    this.matchService.saveTossDetails(this.selectedMatch, this.tossDetails);
    this.proceedToMainSession();
  }

  proceedToMainSession() {
    this.router.navigate(['home/main-session/' +this.selectedMatch]);
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

}

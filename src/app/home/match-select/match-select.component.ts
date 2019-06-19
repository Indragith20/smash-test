import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from 'src/app/services/match.service';

@Component({
  selector: 'app-match-select',
  templateUrl: './match-select.component.html',
  styleUrls: ['./match-select.component.scss'],
})
export class MatchSelectComponent implements OnInit {
  matchId: string;
  constructor(private router: Router, private matchService: MatchService) { }

  ngOnInit() {}

  async saveMatchData() {
    const identifiedDetails = await this.matchService.getFromStorage(this.matchId);
    if(identifiedDetails) {
      console.log(identifiedDetails);
      this.matchService.setDetailsFromStorage(identifiedDetails, this.matchId);
      this.router.navigate(['home/main-session/' +this.matchId]);
    } else {
      this.matchService.saveMatchId(this.matchId);
      this.goToPlayerSelection();
    }
  }

  goToPlayerSelection() {
    this.router.navigate(['home/player-select/' +this.matchId]);
  }

}

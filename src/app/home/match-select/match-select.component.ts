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
    if(identifiedDetails && identifiedDetails[this.matchId].players && identifiedDetails[this.matchId].players.length > 0) {
      if(identifiedDetails[this.matchId].toss && identifiedDetails[this.matchId].toss.choosenAction !== '' && identifiedDetails[this.matchId].toss.wonby !== '') {
        console.log(identifiedDetails);
        this.matchService.setDetailsFromStorage(identifiedDetails, this.matchId);
        this.router.navigate(['home/main-session/' +this.matchId], { replaceUrl: true });  
      } else {
        this.matchService.setDetailsFromStorage(identifiedDetails, this.matchId);
        this.router.navigate(['home/set-details/' +this.matchId], { replaceUrl: true });
      }
    } else {
      this.matchService.saveMatchId(this.matchId);
      this.goToPlayerSelection();
    }
    
    /* if(identifiedDetails) {
      console.log(identifiedDetails);
      this.matchService.setDetailsFromStorage(identifiedDetails, this.matchId);
      this.router.navigate(['home/main-session/' +this.matchId]);
    } else {
      this.matchService.saveMatchId(this.matchId);
      this.goToPlayerSelection();
    } */
  }

  goToPlayerSelection() {
    this.router.navigate(['home/player-select/' +this.matchId], { replaceUrl: true });
  }

}

import { Component, OnInit } from '@angular/core';
import { SHOTTYPE } from 'src/app/constants/shotypes';
import { WINNINGPOINTTYPE, UNFORCEDERRORPOINTTYPE, SERVICEERRORPOINTTYPE } from 'src/app/constants/pointtype';
import { HANDTYPE } from 'src/app/constants/handtype';
import { MatchService } from 'src/app/services/match.service';
import { IPlayerDetails, IAction } from 'src/app/interfaces/match.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-main-session',
  templateUrl: './main-session.component.html',
  styleUrls: ['./main-session.component.scss'],
})
export class MainSessionComponent implements OnInit {
  shotType: string;
  selectedPlayer: string;
  selectedHandType: string;
  showHandType: boolean = false;
  showPointTypes: boolean = false;
  pointMainTypes: string[] = [SHOTTYPE.WINNING_SHOT, SHOTTYPE.SERVICE_ERROR, SHOTTYPE.UNFORCED_ERROR];
  pointTypes: any[] = [];
  winningPointTypes: string[] = [WINNINGPOINTTYPE.DROP, WINNINGPOINTTYPE.FLOATER, WINNINGPOINTTYPE.SERVE, WINNINGPOINTTYPE.SMASH];
  unForcedErrorTypes: string[] = [UNFORCEDERRORPOINTTYPE.LONGAWAY, UNFORCEDERRORPOINTTYPE.NET, UNFORCEDERRORPOINTTYPE.SIDEAWAY];
  serviceErorTypes: string[] = [SERVICEERRORPOINTTYPE.FOULSERVE, SERVICEERRORPOINTTYPE.NET];
  handTypes: string[] = [HANDTYPE.FOREHAND, HANDTYPE.BACKHAND]
  quadrants: any[] = [];
  playersList: IPlayerDetails[] = [];
  selectedMatch: string;
  selectedQuadrant: number;
  selectedPointType: string;
  routeSubscription: Subscription;
  setDetails: string;
  disableStartButton: boolean = false;
  generatedKey: string;
  pointDisplayDetails: any;

  constructor(private matchService: MatchService, private route: ActivatedRoute,
       private router: Router, private toastController: ToastController, private alertController: AlertController) { }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe((data) => {
      this.selectedMatch = data.matchId;
      this.intializeDetails();
    });
    this.quadrants = [1, 2, 3, 4].map((quadrant) => ({ selected: false, quadrant }));
  }

  intializeDetails() {
    if(this.matchService.matchDetails && this.selectedMatch) {
      if(this.matchService.matchDetails[this.selectedMatch].players && this.matchService.matchDetails[this.selectedMatch].players.length > 0) {
        this.playersList = this.matchService.matchDetails[this.selectedMatch].players;
        if(this.matchService.matchDetails[this.selectedMatch].session) {
          const keys = Object.keys(this.matchService.matchDetails[this.selectedMatch].session);
          if(keys.length > 0) {
            this.disableStartButton = true;
            this.generatedKey = keys[keys.length - 1];
            this.pointDisplayDetails = this.matchService.getUpdatedPointDetails(this.selectedMatch, this.playersList[0].playerId, this.playersList[1].playerId, this.generatedKey);
          }
        } else {
          this.disableStartButton = false;
        }
        console.log('Hello' +this.matchService.numberOfSets);
        this.setDetails = `Set - ${this.matchService.numberOfSets}`
      } else {
        this.router.navigate(['home/player-select/' +this.selectedMatch]);
      }
    } else {
      this.router.navigate(['home/match-select']);
    }
  }

  changeSelectedPlayer(event) {
    this.selectedPlayer = event.target.value;
  }

  changeShotType(event) {
    console.log(event.target.value);
    this.shotType = event.target.value;
    switch(this.shotType) {
      case SHOTTYPE.WINNING_SHOT: {
        this.showHandType = true;
        this.showPointTypes = true;
        this.pointTypes = this.winningPointTypes.map((type) => ({ selected: false, type}));
        break;
      }
      case SHOTTYPE.SERVICE_ERROR: {
        this.showHandType = false;
        this.showPointTypes = true;
        this.selectedHandType = '';
        this.pointTypes = this.unForcedErrorTypes.map((type) => ({ selected: false, type}));;
        break;
      }
      case SHOTTYPE.UNFORCED_ERROR: {
        this.showHandType = false;
        this.showPointTypes = true;
        this.selectedHandType = '';
        this.pointTypes = this.serviceErorTypes.map((type) => ({ selected: false, type}));
        break;
      }
      default:
        break;
    }
  }

  selectBallType(selectedball) {
    this.selectedPointType = selectedball.type;
    this.pointTypes = this.pointTypes.map((ball) => {
      if(ball.type === selectedball.type) {
        return { ...ball, selected: !selectedball.selected };
      }
      return { ...ball, selected: false };
    });
  }

  changeHandType(event) {
    this.selectedHandType = event.target.value;
  }

  selectQuadrant(selectedQuadrant) {
    this.selectedQuadrant = selectedQuadrant.quadrant;
    this.quadrants = this.quadrants.map((ball) => {
      if(ball.quadrant === selectedQuadrant.quadrant) {
        return { ...ball, selected: !selectedQuadrant.selected };
      }
      return { ...ball, selected: false };
    });
  }

  recordAction() {
    this.playersList.map((player) => {
      if(player.playerId === this.selectedPlayer) {
        console.log('match found')
      } 
    });
    const identifiedPlayer = this.playersList.find(player => player.playerId == this.selectedPlayer);
    if(identifiedPlayer && this.generatedKey) {
      const recordedAction: IAction = {
        playerId: this.selectedPlayer,
        playerName: identifiedPlayer.playerName,
        pointType: this.shotType,
        pointSubType: this.selectedPointType,
        hand: this.selectedHandType,
        quadrant: this.selectedQuadrant,
        timestamp: new Date().toDateString()
      };
      this.matchService.saveAction(this.selectedMatch, recordedAction, this.generatedKey);
      this.presentToast().then(() => {
        this.pointDisplayDetails = this.matchService.getUpdatedPointDetails(this.selectedMatch, this.playersList[0].playerId, this.playersList[1].playerId, this.generatedKey);
      });
    } else {
      this.presentCommonAlert();
    }
  }

  resetDetails() {
    this.selectedQuadrant = null;
    this.selectedPlayer = null;
    this.selectedHandType = null;
    this.selectedPointType = null;
    this.shotType = null;
    this.pointTypes = [];
    this.quadrants = [1, 2, 3, 4].map((quadrant) => ({ selected: false, quadrant }));
    this.showHandType = false;
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000
    });
    toast.present();
    this.resetDetails();
  }

  async presentCommonAlert() {
    const alert = await this.alertController.create({
      header: 'Please check whether the sesison started and player has been selected',
      buttons: [
        {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok', data);
          }
        }
      ]
    });

    await alert.present();
  }

  startSession() {
    this.disableStartButton = true;
    this.generatedKey = this.matchService.startSet(this.selectedMatch);
  }

  endSession() {
    this.disableStartButton = false;
  }

  goToRecordedSession() {
    this.router.navigate(['home/recorded-session/' +this.selectedMatch]);
  }

  ngOnDestroy() {
    if(this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

}

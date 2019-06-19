import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { stringify } from '@angular/compiler/src/util';
import { AlertController } from '@ionic/angular';
import { MatchService } from 'src/app/services/match.service';
import { IToss } from 'src/app/interfaces/match.interface';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss'],
})
export class PlayerSelectComponent implements OnInit {
  selectedMatch: string;
  playerForm: FormGroup;
  selectedIndex: number;
  selectedAction: string;

  get PlayerArrayForm() {
    return this.playerForm.get('players')
  }

  constructor(private router: Router, private route: ActivatedRoute, 
    private fb: FormBuilder, private alertController: AlertController, private matchService: MatchService) { }

  ngOnInit() {
    this.route.params.subscribe((data) => {
      if(data.matchId) {
        this.selectedMatch = data.matchId;
      }
    });
    this.createFormGroup();
  }

  createFormGroup() {
    this.playerForm = this.fb.group({
      players: this.fb.array([])
    });
    this.setDefaultPlayers();
  }

  setDefaultPlayers() {
    [1, 2].map(() => {
      const newFormGroup = this.fb.group({
        playerId: '',
        playerName: ''
      });
      (this.playerForm.get('players') as FormArray).push(newFormGroup);
    })
    console.log(this.selectedMatch);
    console.log(this.playerForm.value);
  }

  finalizePlayers() {
    console.log(this.playerForm.value);
    const playerDetails = this.playerForm.get('players').value;
    if(this.selectedIndex !== -1 && this.selectedAction) {
      const modifiedToss: IToss = {
        wonby: playerDetails[this.selectedIndex].playerId,
        choosenAction: this.selectedAction
      }
      const modifiedPlayerList = playerDetails.map((player) => {
        if(!player.playerId) {
          return { ...player, playerId: uuid()}
        }
        return player;
      })
      this.matchService.savePlayersList(modifiedPlayerList, this.selectedMatch, modifiedToss);
      this.goToStartSession();
    } else {
      this.presentCommonAlert();
    }
    
  }

  selectToss(i) {
    console.log(i);
    this.selectedIndex = i;
    this.presentAlertRadio();
  }

  goToStartSession() {
    this.router.navigate(['home/main-session/' + this.selectedMatch]);
  }

   async presentAlertRadio() {
    const alert = await this.alertController.create({
      header: 'Choose Action',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Serve',
          value: 'serve',
          checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'Side',
          value: 'side'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok', data);
            this.selectedAction = data;
          }
        }
      ]
    });

    await alert.present();
  }

  async presentCommonAlert() {
    const alert = await this.alertController.create({
      header: 'Select who won the toss',
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



}

import { Injectable } from '@angular/core';
import { IMatchInterface, IMainMatchDetails, IPlayerDetails, IToss, IAction, ISession, IPointDetails, ISessionDetails } from '../interfaces/match.interface';
import { Storage } from '@ionic/storage';
import { v4 as uuid } from 'uuid';
import { SHOTTYPE } from '../constants/shotypes';
import { WINNINGPOINTTYPE, SERVICEERRORPOINTTYPE, UNFORCEDERRORPOINTTYPE } from '../constants/pointtype';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Injectable()
export class MatchService {
    matchDetails: IMainMatchDetails;
    //TODO: NUmber of sets will differ
    numberOfSets: number = 0;
    teamOnePoints: number = 0;
    teamTwoPoints: number = 0;
    constructor(private storage: Storage, private http: HttpClient, private alertController: AlertController) {
    }

    saveToStorage(matchId) {
        this.storage.set(matchId, this.matchDetails);
    }

    getPointDetails(matchId) {
        let pointDetails = {
        };
        let playersList = this.matchDetails[matchId].players;
        Object.keys(this.matchDetails[matchId].session).forEach((sessionKey) => {
            playersList.forEach((player) => {
                pointDetails = {
                    ...pointDetails,
                    [player.playerId]: {
                        ...pointDetails[player.playerId],
                        [sessionKey]: {
                            winningShots: 0,
                            serviceError: 0,
                            unforcedError: 0,
                            winningShotTypes: {
                                smash: 0,
                                drop: 0,
                                floater: 0,
                                serve: 0,
                                foreHand: 0,
                                backHand: 0,
                                smashQuadrant: {
                                    quadrant1: 0,
                                    quadrant2: 0,
                                    quadrant3: 0,
                                    quadrant4: 0,
                                },
                                dropQuadrant: {
                                    quadrant1: 0,
                                    quadrant2: 0,
                                    quadrant3: 0,
                                    quadrant4: 0,
                                },
                                floaterQuadrant: {
                                    quadrant1: 0,
                                    quadrant2: 0,
                                    quadrant3: 0,
                                    quadrant4: 0,
                                },
                                serveQuadrant: {
                                    quadrant1: 0,
                                    quadrant2: 0,
                                    quadrant3: 0,
                                    quadrant4: 0,
                                }
                            },
                            serviceErrorTypes: {
                                net: 0,
                                foulServe: 0
                            },
                            unforcedErrorTypes: {
                                sideAway: 0,
                                longAway: 0,
                                net: 0,
                                miss: 0
                            }
                        }
                    }
                };
                let playerSession = this.matchDetails[matchId].session[sessionKey].filter((sessionDetails) => sessionDetails.playerId === player.playerId);
                playerSession.forEach((session) => {
                    switch (session.pointType) {
                        case SHOTTYPE.WINNING_SHOT: {
                            pointDetails[player.playerId] = {
                                ...pointDetails[player.playerId],
                                [sessionKey]: {
                                    ...pointDetails[player.playerId][sessionKey],
                                    winningShots: pointDetails[player.playerId][sessionKey].winningShots > -1 ? pointDetails[player.playerId][sessionKey].winningShots + 1 : 1,
                                    winningShotTypes: this.getUpdatedWinningShotTypes(pointDetails[player.playerId][sessionKey].winningShotTypes, session.pointSubType, session.quadrant, session.hand)
                                }
                            }
                            break;
                        }
                        case SHOTTYPE.SERVICE_ERROR: {
                            pointDetails[player.playerId] = {
                                ...pointDetails[player.playerId],
                                [sessionKey]: {
                                    ...pointDetails[player.playerId][sessionKey],
                                    serviceError: pointDetails[player.playerId][sessionKey].serviceError > -1 ? pointDetails[player.playerId][sessionKey].serviceError + 1 : 1,
                                    serviceErrorTypes: this.getUpdatedServiceErrorTypes(pointDetails[player.playerId][sessionKey].serviceErrorTypes, session.pointSubType)
                                }
                            }
                            break;
                        }
                        case SHOTTYPE.UNFORCED_ERROR: {
                            pointDetails[player.playerId] = {
                                ...pointDetails[player.playerId],
                                [sessionKey]: {
                                    ...pointDetails[player.playerId][sessionKey],
                                    unforcedError: pointDetails[player.playerId][sessionKey].unforcedError > -1 ? pointDetails[player.playerId][sessionKey].unforcedError + 1 : 1,
                                    unforcedErrorTypes: this.getUpdatedUnforcedErrorTypes(pointDetails[player.playerId][sessionKey].unforcedErrorTypes, session.pointSubType)
                                }
                            }
                            break;
                        }
                        default:
                            break;
                    }
                })
            })
        })
        console.log(pointDetails);
        this.matchDetails = { ...this.matchDetails, [matchId]: { ...this.matchDetails[matchId], pointDetails } };
    }

    getUpdatedQuadrant(currentQuadrant, quadrant) {
        let updated = {};
        switch (String(quadrant)) {
            case '1':
                updated = { ...currentQuadrant, quadrant1: currentQuadrant.quadrant1 + 1 }
                break;
            case '2':
                updated = { ...currentQuadrant, quadrant2: currentQuadrant.quadrant2 + 1 }
                break;
            case '3':
                updated = { ...currentQuadrant, quadrant3: currentQuadrant.quadrant3 + 1 }
                break;
            case '4':
                updated = { ...currentQuadrant, quadrant4: currentQuadrant.quadrant4 + 1 }
                break;
            default:
                break;
        }
        return updated;
    }

    getUpdatedWinningShotTypes(currentValue, pointSubType, quadrant = 0, pointHandType) {
        let updated = {};
        switch (pointSubType) {
            case WINNINGPOINTTYPE.SMASH:
                //currentValue.smashQuadrant;
                updated = { ...currentValue, smash: currentValue.smash + 1, smashQuadrant: this.getUpdatedQuadrant(currentValue.smashQuadrant, quadrant) };
                break;
            case WINNINGPOINTTYPE.DROP:
                updated = { ...currentValue, drop: currentValue.drop + 1, dropQuadrant: this.getUpdatedQuadrant(currentValue.dropQuadrant, quadrant) };
                break;
            case WINNINGPOINTTYPE.FLOATER:
                updated = { ...currentValue, floater: currentValue.floater + 1, floaterQuadrant: this.getUpdatedQuadrant(currentValue.floaterQuadrant, quadrant) };
                break;
            case WINNINGPOINTTYPE.SERVE:
                updated = { ...currentValue, serve: currentValue.serve + 1, serveQuadrant: this.getUpdatedQuadrant(currentValue.serveQuadrant, quadrant) };
                break;
        }
        switch (pointHandType) {
            case 'Forehand': {
                updated = { ...updated, foreHand: currentValue.foreHand + 1 }
            }
            case 'Backhand': {
                updated = { ...updated, backHand: currentValue.backHand + 1 }
            }
            default:
                break;
        }
        return updated;
    }

    getUpdatedServiceErrorTypes(currentValue, pointSubType) {
        let updated = {};
        switch (pointSubType) {
            case SERVICEERRORPOINTTYPE.FOULSERVE:
                updated = { ...currentValue, foulServe: currentValue.foulServe + 1 };
                break;
            case SERVICEERRORPOINTTYPE.NET:
                updated = { ...currentValue, net: currentValue.net + 1 };
                break;
        }
        return updated;
    }

    getUpdatedUnforcedErrorTypes(currentValue, pointSubType) {
        let updated = {};
        switch (pointSubType) {
            case UNFORCEDERRORPOINTTYPE.LONGAWAY:
                updated = { ...currentValue, longAway: currentValue.longAway + 1 };
                break;
            case UNFORCEDERRORPOINTTYPE.NET:
                updated = { ...currentValue, net: currentValue.net + 1 };
                break;
            case UNFORCEDERRORPOINTTYPE.SIDEAWAY:
                updated = { ...currentValue, sideAway: currentValue.sideAway + 1 };
                break;
            case UNFORCEDERRORPOINTTYPE.MISS:
                updated = { ...currentValue, miss: currentValue.miss + 1 };
                break;

        }
        return updated;
    }

    getUpdatedPointDetails(matchId, playerOneId, playerTwoId, sessionId) {
        this.getPointDetails(matchId);
        console.log(this.matchDetails[matchId].pointDetails[playerOneId][sessionId]);
        console.log(this.matchDetails[matchId].pointDetails[playerTwoId][sessionId]);
        let playerPointDetails = {
            playerOne: Number(this.matchDetails[matchId].pointDetails[playerOneId][sessionId].winningShots) +
                Number(this.matchDetails[matchId].pointDetails[playerTwoId][sessionId].serviceError) +
                Number(this.matchDetails[matchId].pointDetails[playerTwoId][sessionId].unforcedError),
            playerTwo: Number(this.matchDetails[matchId].pointDetails[playerTwoId][sessionId].winningShots) +
                Number(this.matchDetails[matchId].pointDetails[playerOneId][sessionId].serviceError) +
                Number(this.matchDetails[matchId].pointDetails[playerOneId][sessionId].unforcedError)
        };
        return playerPointDetails;
    }

    getFromStorage(matchId) {
        return this.storage.get(matchId);
    }

    setDetailsFromStorage(details, matchId) {
        this.matchDetails = { ...details };
        this.numberOfSets = details[matchId].session ? Object.keys(details[matchId].session).length : 0;
    }

    saveMatchId(matchId: string) {
        this.matchDetails = {
            [matchId]: {
                matchId: matchId,
                sessionDetails: {}
            }
        }
        console.log(this.matchDetails);
        this.saveToStorage(matchId);
    }

    savePlayersList(players: IPlayerDetails[], matchId: string) {
        console.log(this.matchDetails);
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...this.matchDetails[matchId],
                players: [...players],
            }
        };
        const currentMatchDetails: IMatchInterface = { ...this.matchDetails[matchId] };
        const modifiedMatchDetails = { ...currentMatchDetails, pointDetails: {} };
        console.log(modifiedMatchDetails);
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...modifiedMatchDetails,
                session: {}
            }
        }
        console.log(this.matchDetails);
        this.saveToStorage(matchId);
    }

    saveTossDetails(matchId: string, tossDetails: IToss) {
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...this.matchDetails[matchId],
                toss: tossDetails
            }
        }
        this.saveToStorage(matchId);
    }

    startSet(matchId: string) {
        this.numberOfSets++;
        const generatedKey = uuid();
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...this.matchDetails[matchId],
                session: {
                    ...this.matchDetails[matchId].session,
                    [generatedKey]: []
                },
                sessionDetails: {
                    ...this.matchDetails[matchId].sessionDetails,
                    [generatedKey]: {}
                }
            }
        };
        this.saveToStorage(matchId);
        return generatedKey;
    }

    formatData(matchDetails: IMatchInterface) {
        const sampleArray = [];
        sampleArray.push[`Match Details${this.matchDetails.matchId}`];
        if (matchDetails && matchDetails.players && matchDetails.pointDetails) {
            let headerArray = ['Player Name'];
            for (let i = 1; i <= Object.keys(matchDetails.sessionDetails).length; i++) {
                headerArray.push(`Set ${i}`)
            };
            sampleArray.push(headerArray);
            matchDetails.players.forEach((player) => {
                let playerName = player.playerName;
                let playersArray = [];
                playersArray.push(playerName);
                Object.keys(matchDetails.sessionDetails).forEach((session) => {
                    playersArray.push(matchDetails.sessionDetails[session][playerName]);
                })
                sampleArray.push(playersArray);
            });
            sampleArray.push([]);
            matchDetails.players.forEach((player) => {
                sampleArray.push([player.playerName]);
                let setArray = [];
                let smashArray = ['Smash'];
                let dropArray = ['Drop'];
                let floaterArray = ['Floater'];
                let winningServeArray = ['Serve'];
                let serviceNetArray = ['Net'];
                let serviceFoulServeArray = ['Foul Serve'];
                let sideAwayArray = ['Side Away'];
                let longAwayArray = ['Long Away'];
                let netArray = ['Net'];
                let foreHandArray = ['ForeHand'];
                let backHandArray = ['BackHand'];
                let smashQuadrantArray = ['smash', 0, 0, 0, 0];
                let dropQuadrantArray = ['drop', 0, 0, 0, 0];
                let floaterQuadrantArray = ['floater', 0, 0, 0, 0];
                let serveQuadrantArray = ['serve', 0, 0, 0, 0];
                Object.keys(matchDetails.pointDetails[player.playerId]).map((sessionKey, index) => {
                    let session = matchDetails.pointDetails[player.playerId][sessionKey];
                    setArray.push(`Set ${index + 1}`);
                    smashArray.push(String(session.winningShotTypes.smash));
                    dropArray.push(String(session.winningShotTypes.drop));
                    floaterArray.push(String(session.winningShotTypes.floater));
                    winningServeArray.push(String(session.winningShotTypes.serve));
                    serviceNetArray.push(String(session.serviceErrorTypes.net));
                    serviceFoulServeArray.push(String(session.serviceErrorTypes.foulServe));
                    sideAwayArray.push(String(session.unforcedErrorTypes.sideAway));
                    longAwayArray.push(String(session.unforcedErrorTypes.longAway));
                    netArray.push(String(session.unforcedErrorTypes.net));
                    foreHandArray.push(String(session.winningShotTypes.foreHand));
                    backHandArray.push(String(session.winningShotTypes.backHand));
                    if (session.winningShotTypes) {
                        Object.keys(session.winningShotTypes).forEach((shotType) => {
                            switch (shotType) {
                                case 'smashQuadrant': {
                                    smashQuadrantArray.forEach((shotcount, index) => {
                                        if (index !== 0) {
                                            smashQuadrantArray[index] = Number(smashQuadrantArray[index]) + Number(session.winningShotTypes[shotType][`quadrant${index}`]);
                                        }
                                    });
                                    break;
                                }
                                case 'dropQuadrant': {
                                    dropQuadrantArray.forEach((shotcount, index) => {
                                        if (index !== 0) {
                                            dropQuadrantArray[index] = Number(dropQuadrantArray[index]) + Number(session.winningShotTypes[shotType][`quadrant${index}`]);
                                        }
                                    });
                                    break;
                                }
                                case 'floaterQuadrant': {
                                    floaterQuadrantArray.forEach((shotcount, index) => {
                                        if (index !== 0) {
                                            floaterQuadrantArray[index] = Number(floaterQuadrantArray[index]) + Number(session.winningShotTypes[shotType][`quadrant${index}`]);
                                        }
                                    });
                                    break;
                                }
                                case 'serveQuadrant': {
                                    serveQuadrantArray.forEach((shotcount, index) => {
                                        if (index !== 0) {
                                            serveQuadrantArray[index] = Number(serveQuadrantArray[index]) + Number(session.winningShotTypes[shotType][`quadrant${index}`]);
                                        }
                                    });
                                    break;
                                }
                            }
                        })
                    }


                })
                /* sampleArray.push(setArray); */
                let winningShotArray = ['Winning Shots'];
                sampleArray.push(winningShotArray.concat(setArray));
                sampleArray.push(smashArray);
                sampleArray.push(dropArray);
                sampleArray.push(floaterArray);
                sampleArray.push(winningServeArray);
                sampleArray.push([]);
                let serviceErrorArray = ['Service Error'];
                sampleArray.push(serviceErrorArray.concat(setArray));
                sampleArray.push(serviceNetArray);
                sampleArray.push(serviceFoulServeArray);
                sampleArray.push([]);
                let unforcedErrorArray = ['UnForced Error'];
                sampleArray.push(unforcedErrorArray.concat(setArray));
                sampleArray.push(sideAwayArray);
                sampleArray.push(longAwayArray);
                sampleArray.push(netArray);
                sampleArray.push([]);
                let handTypeArray = ['Hand'];
                sampleArray.push(handTypeArray.concat(setArray));
                sampleArray.push(foreHandArray);
                sampleArray.push(backHandArray);
                sampleArray.push([]);
                let heatMapArray = ['heat map']
                sampleArray.push(heatMapArray);
                sampleArray.push(['shot type', 'Quadrant 1', 'Quadrant 2', 'Quadrant 3', 'Quadrant 4']);
                sampleArray.push(smashQuadrantArray);
                sampleArray.push(dropQuadrantArray);
                sampleArray.push(floaterQuadrantArray);
                sampleArray.push(serveQuadrantArray);
                sampleArray.push([]);
            })
            console.log(sampleArray);
            return sampleArray;

        }
        return [];
    }

    exportAsExcel(matchId: string) {
        const content = this.formatData(this.matchDetails[matchId]);
        /* const content = [
            ["Item", "Cost", "Stocked", "Ship Date"],
            ["Wheel", "$20.50", "4", "3/1/2016"],
            ["Door", "$15", "2", "3/15/2016"],
            ["Engine", "$100", "1", "30/20/2016"],
            ["Totals", "=SUM(B2:B4)", "=SUM(C2:C4)", "=MAX(D2:D4)"]
        ]; */
        this.http.post('http://localhost:8080/', { title: matchId, content: JSON.stringify(content) }).subscribe((data) => {
            console.log(data);
            if (data) {
                this.showAlert();
            }
        })

        // this.http.post('https://frozen-sea-76181.herokuapp.com/', { title: matchId, content: JSON.stringify(content)}).subscribe((data) => {
        //     console.log(data);
        // })
    }

    async showAlert() {
        const alert = await this.alertController.create({
            header: 'Data Saved Successfully',
            buttons: [
                {
                    text: 'Okay',
                    handler: (data) => {
                        console.log('Confirm Ok', data);
                    }
                }
            ]
        });

        await alert.present();

    }

    saveAction(matchId: string, recordedAction: IAction, generatedKey: string) {
        const exisingValues: IAction[] = this.matchDetails[matchId].session[generatedKey] ? [...this.matchDetails[matchId].session[generatedKey]] : [];
        exisingValues.push(recordedAction);
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...this.matchDetails[matchId],
                session: {
                    ...this.matchDetails[matchId].session,
                    [generatedKey]: exisingValues
                }
            }
        };
        console.log(this.matchDetails);
        this.saveToStorage(matchId);
    }

    undoAction(matchId: string, sessionKey: string): boolean {
        if (this.matchDetails[matchId].session[sessionKey] && this.matchDetails[matchId].session[sessionKey].length > 0) {
            const exisitingSession = this.matchDetails[matchId].session[sessionKey];
            const exisitingSessionLength = exisitingSession.length;
            this.matchDetails[matchId].session[sessionKey].splice(exisitingSessionLength - 1, 1);
            this.saveToStorage(matchId);
            return true;
        } else {
            return false;
        }
    }

    recordSessionDetails(modifiedSession: ISessionDetails, matchId: string, sessionKey: string) {
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...this.matchDetails[matchId],
                sessionDetails: {
                    ...this.matchDetails[matchId].sessionDetails,
                    [sessionKey]: modifiedSession
                }
            }
        };
        this.saveToStorage(matchId);
    }
}
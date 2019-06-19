import { Injectable } from '@angular/core';
import { IMatchInterface, IMainMatchDetails, IPlayerDetails, IToss, IAction, ISession, IPointDetails } from '../interfaces/match.interface';
import { Storage } from '@ionic/storage';
import { v4 as uuid } from 'uuid';
import { SHOTTYPE } from '../constants/shotypes';

@Injectable()
export class MatchService {
    matchDetails: IMainMatchDetails;
    //TODO: NUmber of sets will differ
    numberOfSets: number = 0;
    teamOnePoints: number = 0;
    teamTwoPoints: number = 0;
    constructor(private storage: Storage) {
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
                            unForcedError: 0
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
                                    winningShots: pointDetails[player.playerId][sessionKey].winningShots > -1 ? pointDetails[player.playerId][sessionKey].winningShots + 1 : 1
                                }
                            }
                            break;
                        }
                        case SHOTTYPE.SERVICE_ERROR: {
                            pointDetails[player.playerId] = {
                                ...pointDetails[player.playerId],
                                [sessionKey]: {
                                    ...pointDetails[player.playerId][sessionKey],
                                    serviceError: pointDetails[player.playerId][sessionKey].serviceError > -1 ? pointDetails[player.playerId][sessionKey].serviceError + 1 : 1
                                }
                            }
                            break;
                        }
                        case SHOTTYPE.UNFORCED_ERROR: {
                            pointDetails[player.playerId] = {
                                ...pointDetails[player.playerId],
                                [sessionKey]: {
                                    ...pointDetails[player.playerId][sessionKey],
                                    unforcedError: pointDetails[player.playerId][sessionKey].unforcedError > -1 ? pointDetails[player.playerId][sessionKey].unforcedError + 1 : 1
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

    getUpdatedPointDetails(matchId, playerOneId, playerTwoId, sessionId) {
        this.getPointDetails(matchId);
        let playerPointDetails = {
            playerOne: this.matchDetails[matchId].pointDetails[playerOneId][sessionId].winningShots + 
                        this.matchDetails[matchId].pointDetails[playerTwoId][sessionId].serviceError + 
                        this.matchDetails[matchId].pointDetails[playerTwoId][sessionId].unforcedError,
            playerTwo: this.matchDetails[matchId].pointDetails[playerTwoId][sessionId].winningShots + 
                        this.matchDetails[matchId].pointDetails[playerOneId][sessionId].serviceError + 
                        this.matchDetails[matchId].pointDetails[playerOneId][sessionId].unforcedError
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
            }
        }
        console.log(this.matchDetails);
        this.saveToStorage(matchId);
    }

    savePlayersList(players: IPlayerDetails[], matchId: string, tossDetails: IToss) {
        console.log(this.matchDetails);
        this.matchDetails = {
            ...this.matchDetails,
            [matchId]: {
                ...this.matchDetails[matchId],
                players: [...players]
            }
        };
        if (tossDetails) {
            this.matchDetails = {
                ...this.matchDetails,
                [matchId]: {
                    ...this.matchDetails[matchId],
                    toss: tossDetails
                }
            }
        }
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
                }
            }
        };
        this.saveToStorage(matchId);
        return generatedKey;
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
}
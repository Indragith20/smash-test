export interface IMatchInterface {
    matchId: string;
    players?: IPlayerDetails[];
    toss?: IToss;
    session?: ISession;
    pointDetails?: IPointDetails;
}

export interface IPointDetails {
    //THis will be player id
    [key: string]: ISetDetails;
}

export interface ISetDetails {
    //This will be unique set key
    [key: string]: {
        winningShots: number;
        serviceError: number;
        unforcedError: number;
        totalPoints: number;
    }
}

export interface IPlayerDetails {
    playerId: string;
    playerName: string;
}

export interface IToss {
    wonby: string;
    choosenAction: string;
}

export interface ISession {
    [key: string]: IAction[];
}
export interface IAction {
    pointType: string;
    pointSubType: string;
    hand?: string;
    quadrant?: number;
    timestamp: string;
    playerId: string;
    playerName: string;
}

export interface IMainMatchDetails {
    [key: string]: IMatchInterface;
}
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
        winningShotTypes: IWinningShotTypes;
        serviceErrorTypes: IServiceErrorTypes;
        unforcedErrorTypes: IUnforcedErrorTypes;
    }
}

export interface IWinningShotTypes {
    smash: number;
    drop: number;
    floater: number;
    serve: number;
    smashQuadrant: IQuadrantTypes;
    dropQuadrant: IQuadrantTypes;
    floaterQuadrant: IQuadrantTypes;
    serveQuadrant: IQuadrantTypes;
}

export interface IQuadrantTypes {
    quadrant1: number;
    quadrant2: number;
    quadrant3: number;
    quadrant4: number;
}

export interface IServiceErrorTypes {
    net: number;
    foulServe: number;
}

export interface IUnforcedErrorTypes {
    sideAway: number;
    longAway: number;
    net: number;
}

export interface IPlayerDetails {
    playerId: string;
    playerName: string;
}

export interface IToss {
    wonby: string;
    choosenAction: string;
    numberOfSets: string;
    setPoints: string;
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
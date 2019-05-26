
export default class Data {
  constructor(name){
    this.lineup = name;
    this.time = 0;
    this.pointsFor = 0;
    this.pointsAgainst = 0;
    this.defRebFor = 0;
    this.defRebAgainst = 0;
    this.offRebFor = 0;
    this.offRebAgainst = 0;
    this.madeTwosFor = 0;
    this.madeTwosAgainst = 0;
    this.attemptedTwosFor = 0;
    this.attemptedTwosAgainst = 0;
    this.madeThreesFor = 0;
    this.madeThreesAgainst = 0;
    this.attemptedThreesFor = 0;
    this.attemptedThreesAgainst = 0;
    this.assistsFor = 0;
    this.assistsAgainst = 0;
    this.turnoversFor = 0;
    this.turnoversAgainst = 0;
    this.ftaFor = 0;
    this.ftaAgainst = 0;
    this.possFor = 0;
    this.possAgainst = 0;
    this.totalShotsFor = 0;
    this.totalShotsAgainst = 0;
  }
}
export const roster = [
  "Brandon Childress",
  "Isaiah Mucius",
  "Sharone Wright",
  "Torry Johnson",
  "Jaylen Hoard",
  "Andrien White",
  "Michael Wynn",
  "Jamie Lewis",
  "Chaundee Brown",
  "Blake Buchanan",
  "Olivier Sarr",
  "Ikenna Smart",
  "Sunday Okeke",
  "Anthony Bilas",
  "Aaron Spivey",

];
export const setPlayerStats = (array) => {
  let playerArray = [];
  roster.forEach((player)=>{
    let playerObject = new Data(player)
    array.forEach((lineup)=>{
      //lineup just refers to a single player in this case
      //if the lineup includes the players name
      if(lineup.lineup.includes(player)){
        updateStats(playerObject, lineup);
      }
    })
    playerArray.push(playerObject);
  })
  return playerArray
}
export const updateStats = (lineup, temp) => {
  Object.keys(lineup).forEach((prop)=>{
    if(prop === 'lineup'){
      //do nothing
    }
    else{
      lineup[prop] += temp[prop];
    }
  })
}

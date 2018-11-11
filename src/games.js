import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {HashRouter as Router, Route, Switch, Link} from 'react-router-dom';
import config from './config.js'
import * as firebase from 'firebase'
import Dropdown from './dropDown.js';
import roster from "./roster.js"
import convert from 'convert-seconds';


import logo from './logo.svg';


const fixTime = seconds => {
  let secs = convert(seconds).seconds
  if(secs < 10){
    secs = "0" + secs;
  }
  const minutes = convert(seconds).minutes + (convert(seconds).hours*60);
  return minutes + ":" + secs;
}

const totalStats = (array) => {
  let time = 0;
  let pf = 0;
  let pa = 0;
  array.forEach((lineup)=>{
    time += lineup.time;
    pf += lineup.pointsFor;
    pa += lineup.pointsAgainst;
  });
  return {time: time, pointsFor: pf, pointsAgainst: pa};
}
const checkRoster = (array) => {
  let isIncluded = true;
  array.forEach((name)=>{
    if(roster.includes(name) || name === ""){
      //do nothing
    }
    else{
      isIncluded = false;
    }
  });
  return isIncluded;
}

class Data {
  constructor(lineup, pointsFor, pointsAgainst,time) {
    this.lineup = lineup;
    this.pointsFor = parseInt(pointsFor,10);
    this.pointsAgainst = parseInt(pointsAgainst,10);
    this.time = parseInt(time,10);
  }
}
const testArray = (array) => array.forEach((x) => console.log(x));

const setUpName = (array) =>{
  roster.forEach((name) =>{
    array.push(new Data (name, 0, 0, 0));
  })
}

const fixName = (string) => {
  string = Array.from(string);      //convert string to array
  string.forEach((x,i) => {       //itereate through
    if(x === '_'){                //if x is a -, change it to a space
      string[i] = " ";
    }
  })
  return string.join("");
}

const adjustName = (string) => {
  string = Array.from(string);      //convert string to array
  string.forEach((x,i) => {       //itereate through
    if(x === '_'){                //if x is a -, change it to a space
      string[i] = " ";
    }
    else if (x === "@"){
      string[i] = "";
    }
  })
  return string.join("");
}

 class Finder extends Component {
  constructor(){
    super();
    this.handleInput = this.handleInput.bind(this);
    this.state = {player1: "", player2: "", player3: "", player4: "", player5: ""}
  }
  handleInput(e){
    this.setState({[e.target.name]: e.target.value});
  }
  render(){
    return(
    <div className = "finder">
      <div>
      <h2>Lineup Finder</h2>
      <p>Enter up to 5 players to find a specific lineup. Leave the input blank if it is unused.</p>
        <p><b>Player 1: <input className = "finderText" type="text" onChange = {this.props.handleInput} name = "player1" value = {this.props.player1}/></b></p>
        <p><b>Player 2: <input className = "finderText" type="text" onChange = {this.props.handleInput} name = "player2" value = {this.props.player2}/></b></p>
        <p><b>Player 3: <input className = "finderText" type="text" onChange = {this.props.handleInput} name = "player3" value = {this.props.player3}/></b></p>
        <p><b>Player 4: <input className = "finderText" type="text" onChange = {this.props.handleInput} name = "player4" value = {this.props.player4}/></b></p>
        <p><b>Player 5: <input className = "finderText" type="text" onChange = {this.props.handleInput} name = "player5" value = {this.props.player5}/></b></p>
        <p style = {{position: "relative", left: "35px"}}><button className = "lineupSubmit" type = "button" onClick = {this.props.onClick}>Submit</button>
        <button className = "lineupSubmit" type = "button" onClick = {this.props.cancel}>Cancel</button></p>
      </div>
    </div>
  )}
}

export default class Game extends Component {
  constructor(props){
    super(props);
    this.ref = firebase.database().ref(this.props.gameName);
    this.state = {dataArray: [], wakeScore: 0, oppScore: 0, loading:true, dataType: "lineup", playerArray:[],
      finder: false, player1: "", player2: "", player3: "", player4: "", player5: "", finderArray:[]};
    this.ascending = true;
    this.cancel = this.cancel.bind(this);
    this.sortLineupTable = this.sortLineupTable.bind(this);
    this.sortPlayerTable = this.sortPlayerTable.bind(this);
    this.sortFinderTable = this.sortFinderTable.bind(this);
    this.lineupFinder = this.lineupFinder.bind(this);
    this.activateFinder = this.activateFinder.bind(this);
    this.back = this.back.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.sortLineupType = 'net';
    this.sortPlayerType = 'net';
    this.opponent = fixName(this.props.gameName);
    this.switchData = this.switchData.bind(this);
    this.makePlayerArray = this.makePlayerArray.bind(this);
  }
  componentWillMount(){
     this.getData = this.ref.once('value').then((snapshot) => {
       let array =[];
       snapshot.child('lineups').forEach((x)=>{
         array.push(new Data(x.key, x.val().pointsFor,x.val().pointsAgainst, x.val().time));
       });
       let wakeScore = snapshot.child('score').child('wake').val();
       let oppScore = snapshot.child('score').child("opp").val();

       array.sort((a,b)=> {return(a.pointsFor-a.pointsAgainst)-(b.pointsFor-b.pointsAgainst)}).reverse();

       this.setState({dataArray: array, wakeScore: wakeScore, oppScore: oppScore, loading:false});
     });


   }
   makePlayerArray(){
     let tempArray =[];
     let playerArray =[];
     setUpName(tempArray)   //add all of the players to the array for searching
     //for each player, search the lineups for them and add the data to their own
     tempArray.forEach((player)=> {
       this.state.dataArray.forEach((data)=>{
         if(data.lineup.includes(player.lineup)){
           player.pointsFor += data.pointsFor;
           player.pointsAgainst += data.pointsAgainst;
           player.time += data.time;
         }
       });
     });
     //remove any players that did not play
     tempArray.forEach((data,i) =>{
       if(data.time === 0 && data.pointsFor === 0 && data.pointsAgainst === 0){
         //do nothing
       }
       else{
         playerArray.push(tempArray[i]);
       }
     })
     playerArray.sort((a,b)=> {return(a.pointsFor-a.pointsAgainst)-(b.pointsFor-b.pointsAgainst)}).reverse();
     this.setState({playerArray: playerArray});
   }
   sortLineupTable(e){
     let type = e.target.id;
     let array = this.state.dataArray;
     if(type === this.sortLineupType){         //if the sort type is the same, reverse the order
       array.reverse();
     }
     else{
       if(type === "net"){
         array.sort((a,b)=>{return (a.pointsFor-a.pointsAgainst) - (b.pointsFor -b.pointsAgainst)}).reverse();
         this.sortLineupType = "net";
       }
       else if (type === "pf"){
         array.sort((a,b)=>{return (b.pointsFor) - (a.pointsFor)});
         this.sortLineupType = "pf";
       }
       else if(type === "pa"){
         array.sort((a,b)=>{return (b.pointsAgainst) - (a.pointsAgainst)});
         this.sortLineupType = "pa";
       }
       else if (type === "time"){
         array.sort((a,b)=>{return (b.time) - (a.time)});
         this.sortLineupType = "time";
       }
     }
       this.setState({dataArray: array});
   }
   sortPlayerTable(e){
     let type = e.target.id;
     let array = this.state.playerArray;
     if(type === this.sortPlayerType){         //if the sort type is the same, reverse the order
       array.reverse();
     }
     else{
       if(type === "net"){
         array.sort((a,b)=>{return (a.pointsFor-a.pointsAgainst) - (b.pointsFor -b.pointsAgainst)}).reverse();
         this.sortPlayerType = "net";
       }
       else if (type === "pf"){
         array.sort((a,b)=>{return (b.pointsFor) - (a.pointsFor)});
         this.sortPlayerType = "pf";
       }
       else if(type === "pa"){
         array.sort((a,b)=>{return (b.pointsAgainst) - (a.pointsAgainst)});
         this.sortPlayerType = "pa";
       }
       else if (type === "time"){
         array.sort((a,b)=>{return (b.time) - (a.time)});
         this.sortPlayerType = "time";
       }
     }
       this.setState({playerArray: array});
   }
  switchData(){
    if(this.state.dataType === "lineup"){
      if(this.state.playerArray.length === 0){
        this.makePlayerArray();
      }
      this.setState({dataType: "player"});
    }
    else{
      this.setState({dataType: "lineup"});
    }
  }
  sortFinderTable(e){
    let type = e.target.id;
    let array = this.state.finderArray;
    if(type === this.sortFinderType){         //if the sort type is the same, reverse the order
      array.reverse();
    }
    else{
      if(type === "net"){
        array.sort((a,b)=>{return (a.pointsFor-a.pointsAgainst) - (b.pointsFor -b.pointsAgainst)}).reverse();
        this.sortFinderType = "net";
      }
      else if (type === "pf"){
        array.sort((a,b)=>{return (b.pointsFor) - (a.pointsFor)});
        this.sortFinderType = "pf";
      }
      else if(type === "pa"){
        array.sort((a,b)=>{return (b.pointsAgainst) - (a.pointsAgainst)});
        this.sortFinderType = "pa";
      }
      else if (type === "time"){
        array.sort((a,b)=>{return (b.time) - (a.time)});
        this.sortFinderType = "time";
      }
    }
      this.setState({FinderArray: array});
  }
  activateFinder(){
    this.setState({finder:true});
  }
  handleInput(e){
    this.setState({[e.target.name]: e.target.value});
  }
  lineupFinder(){
    let tempArray = [this.state.player1,this.state.player2,this.state.player3,this.state.player4,this.state.player5]
    let fixedArray =[];
    tempArray.forEach((name,i) => {
      if(name !=""){
        fixedArray.push(tempArray[i]);
      }
    })

    if(!checkRoster(fixedArray)){
      alert("One of the players is misspelled or not a member of the team");
    }
    else{
      let finderArray =[];
      this.state.dataArray.forEach((lineup) => {
        if(fixedArray.every(name => lineup.lineup.includes(name))){
          finderArray.push(lineup);
        }});
        this.setState({finderArray: finderArray, dataType: "finder",finder: false});
      }
    }
    back(){
      this.setState({dataType: 'lineup', finder:false});
    }
    cancel(){
      this.setState({finder:false});
    }
  render(){
    return (
      <div className="App">
        <header className="App-header">
          <div style = {{position: "relative", top: "-20px", fontSize: "25px"}}><p>Wake Forest: {this.state.wakeScore}</p>
          <p style ={{position: "relative", top: "-28px", marginBottom: "-10px"}}>{adjustName(this.props.gameName)}: {this.state.oppScore}</p>
          <Dropdown></Dropdown>
        </div>

            {this.state.dataType === "lineup" &&
              <button className = "type" onClick = {this.switchData}>View Players</button>}
            {this.state.dataType === "player" &&
              <button className = "type" onClick = {this.switchData}>View Lineups</button>}
              <button className = "finderButton" onClick = {this.activateFinder}>Lineup Finder</button>
        </header>
        {this.state.finder && <Finder onClick = {this.lineupFinder} cancel = {this.cancel}
          player1 = {this.state.player1}   player2 = {this.state.player2} player3 = {this.state.player3}
          player4 = {this.state.player4}   player5 = {this.state.player5}
          handleInput = {this.handleInput}/>}
        {(this.state.dataType === 'player' &&
          <table>
            <tbody>
              <tr>
                  <th>Player</th>
                  <th  style = {{width: "14%"}}className = "click" id = "time" onClick = {this.sortPlayerTable}>Time</th>
                  <th  style = {{width: "10%"}}className = "click" id = "pf" onClick = {this.sortPlayerTable}>PF</th>
                  <th  style = {{width: "10%"}}className = "click" id = "pa" onClick = {this.sortPlayerTable}>PA</th>
                  <th style = {{width: "10%"}}className = "click" id = "net" onClick = {this.sortPlayerTable}>+/-</th>

              </tr>
          {this.state.playerArray.map((x,i) => {
            return (
              <tr key ={i} style = {{height: "58px", fontSize: "calc(8px + .8vw)", fontFamily: "Tahoma, Verdana, Segoe, sans-serif"}}>
                <td>{x.lineup}</td><td>{fixTime(x.time)}</td><td>{x.pointsFor}</td><td>{x.pointsAgainst}</td><td>{x.pointsFor-x.pointsAgainst}</td>
              </tr>
            )
          })
          }
          </tbody>
          </table>
        )}
        {(this.state.dataType === 'lineup' &&
        <table>
          <tbody>
            <tr>
                <th>Lineup</th>
                <th  style = {{width: "14%"}}className = "click" id = "time" onClick = {this.sortLineupTable}>Time</th>
                <th  style = {{width: "10%"}}className = "click" id = "pf" onClick = {this.sortLineupTable}>PF</th>
                <th  style = {{width: "10%"}}className = "click" id = "pa" onClick = {this.sortLineupTable}>PA</th>
                <th style = {{width: "10%"}}className = "click" id = "net" onClick = {this.sortLineupTable}>+/-</th>

            </tr>
        {this.state.dataArray.map((x,i) => {
          return (
            <tr key ={i} style = {{height: "58px", fontSize: "calc(8px + .8vw)", fontFamily: "Tahoma, Verdana, Segoe, sans-serif"}}>
              <td>{x.lineup}</td><td>{fixTime(x.time)}</td><td>{x.pointsFor}</td><td>{x.pointsAgainst}</td><td>{x.pointsFor-x.pointsAgainst}</td>
            </tr>
          )
        })
        }
        </tbody>
        </table>
      )}
      {(this.state.dataType === 'finder' &&
      <div>
      <table>
        <tbody>
          <tr>
              <th>Lineup</th>
              <th  style = {{width: "14%"}}className = "click" id = "time" onClick = {this.sortFinderTable}>Time</th>
              <th  style = {{width: "10%"}}className = "click" id = "pf" onClick = {this.sortFinderTable}>PF</th>
              <th  style = {{width: "10%"}}className = "click" id = "pa" onClick = {this.sortFinderTable}>PA</th>
              <th style = {{width: "10%"}}className = "click" id = "net" onClick = {this.sortFinderTable}>+/-</th>

          </tr>
      {this.state.finderArray.map((x,i) => {
        return (
          <tr key ={i} style = {{height: "58px", fontSize: "calc(8px + .8vw)", fontFamily: "Tahoma, Verdana, Segoe, sans-serif"}}>
            <td>{x.lineup}</td><td>{fixTime(x.time)}</td><td>{x.pointsFor}</td><td>{x.pointsAgainst}</td><td>{x.pointsFor-x.pointsAgainst}</td>
          </tr>
        )
      })}
      <tr style = {{height: "58px", fontSize: "calc(8px + .8vw)", fontFamily: "Tahoma, Verdana, Segoe, sans-serif"}}>
      <td>Total</td><td>{fixTime(totalStats(this.state.finderArray).time)}</td><td>{totalStats(this.state.finderArray).pointsFor}</td>
      <td>{totalStats(this.state.finderArray).pointsAgainst}</td><td>{totalStats(this.state.finderArray).pointsFor - totalStats(this.state.finderArray).pointsAgainst}</td>
      </tr>
      </tbody>
      </table>
      <button className = "back" onClick = {this.back}>Back</button>
      </div>
    )}
      </div>
    );
  }
}
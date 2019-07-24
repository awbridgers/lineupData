import { lineupData } from './gameData.js';
import { individualGames } from './individualGames.js'
import { gameName } from './gameName.js'
import { dataType } from './dataType.js'
import { finder, finderActive } from './finder.js'
import { dataLoaded} from './dataLoaded.js'
import { sort } from './sort.js'
import {infoType} from './infoType.js'
import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { accData } from './accData.js'
import { glossary } from './glossary.js'

const rootReducer = (history) => combineReducers({
  router: connectRouter(history),
  lineupData,
  individualGames,
  gameName,
  dataType,
  finder,
  finderActive,
  dataLoaded,
  sort,
  infoType,
  accData,
  glossary,
})

export default rootReducer

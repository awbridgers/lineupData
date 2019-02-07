export const sort = (state = {}, action)=>{
  switch(action.type){
    case 'CHANGE_SORT_TYPE':
      if(action.prevSort === action.newSort){
        return {...state,
          [action.array]:{
            ...state[action.array],
            reverse: !state[action.array].reverse
          }
        }
      }
      else{
        return {...state,
          [action.array]:{
            reverse: false,
            sortType: action.newSort
          }
        }
      }
    default:
      return {
        lineup:{
          sortType: 'net',
          reverse: false
        },
        player:{
          sortType: 'net',
          reverse: false
        },
        finder:{
          sortType: 'net',
          reverse: false
        }
      }
    }
}

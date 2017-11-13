const redux=require('../libs/redux.min');
const reduxThunk=require('../libs/redux-thunk.min').default;
let store=redux.createStore(require('./reducers/index'),{},redux.applyMiddleware(
    reduxThunk
));
module.exports=store;
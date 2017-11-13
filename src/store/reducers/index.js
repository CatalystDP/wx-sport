const redux=require('../../libs/redux.min');
module.exports=redux.combineReducers({
    step:require('./step.reducer'),
    user:require('./user.reducer')
});
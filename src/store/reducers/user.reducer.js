const userAction=require('../actions/user.action');

let initialState={
    loginStatus:false
};
function userReducer(state=initialState,action){
    switch(action.type){
        case userAction.SET_USER_INFO:
            return Object.assign(state,{...action.userInfo});
    }
    return state;
}
module.exports=userReducer;
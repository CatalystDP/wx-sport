const stepAction=require('../actions/step.action');
let initalState={
    stepData:{},
    targetStep:0,
    maxStatisStep:15000,
};
function stepReducer(state=initalState,action){
    switch(action.type){
        case stepAction.SET_CUR_STEP:
           return Object.assign(state,{
               stepData:action.stepData
           }); 
        case stepAction.SET_TARGET_STEP:
            return Object.assign(state,{
                targetStep:action.targetStep
            })
    }
    return state;
}
module.exports=stepReducer;
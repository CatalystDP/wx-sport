var util=module.exports={
    lang:{
        is: function (obj, type) {
            return Object.prototype.toString.call(obj).replace(/\[|\]/g, '').substr(7).toLowerCase() === type;
        },
        isObject: function (obj) {
            return util.lang.is(obj, 'object');
        },
        isArray: function (obj) {
            return util.lang.is(obj, 'array');
        },
        isFunction: function (obj) {
            return util.lang.is(obj, 'function');
        }
    }
};
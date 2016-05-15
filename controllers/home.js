'use strict';
const views = require('co-views');
const parse = require('co-body');
const messages = [{
    id: 0,
    message: 'Koa next generation web framework for node.js'
}, {
    id: 1,
    message: 'Koa is a new web framework designed by the team behind Express'
}];
const render = views(__dirname + '/../views', {
    map: { html: 'swig' }
});
var Page = {
    /**
     * 基本资料
     * @yield {[type]} [description]
     */

    home: function* home(ctx) {
        this.body = yield render('list', { 'messages': messages });
    },
    index: function*() {
        this.body = yield render('homepage', { 'messages': messages });
        console.log('df');
        // this.throw('hehe');
        // var self = this;
        // var data = {};
        // if (!self.state.user){
        //   self.userAuth.redirect();
        //   return;
        // }

        // var nowTime = new Date().getTime();
        // varimguploadtoken = crypto.createHash('md5').update('trade_avatar_' + self.state.user.openId + '_uploafdoxriaxoimai_' + nowTime).digest('hex');

        // _.assign(data, {
        //   page: {
        //     name: '基本资料',
        //     type: 'user',
        //     style: 'about',
        //     script: 'about',
        //     spmb: '7906996'
        //   },
        //   date: {
        //     now: nowTime
        //   }
        // });
        // data.imguploadtoken = imguploadtoken;
        // data.callid = nowTime;
        // data.encodeUri = Utils.encodeUri;
        // data.avatarUrl = Utils.avatarUrl;
        // yield this.render('about', data);
    }
};

var Api = {};

module.exports.Page = Page;
module.exports.Api = Api
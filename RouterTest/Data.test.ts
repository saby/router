import { assert } from 'chai';
import { App } from 'Application/Env';
import { Data } from 'Router/router';

let configState;

describe('Router/Data', () => {
   describe('getRelativeUrlWithService', () => {
      beforeEach(() => {
         configState = App.getRequest().getConfig().getState();
      });

      afterEach(() => {
         App.getRequest().getConfig().setState(configState);
      });

      it('empty appRoot', () => {
         assert.equal(Data.getRelativeUrlWithService('/page/main'), '/page/main');
         assert.equal(Data.getRelativeUrlWithService('page/main'), 'page/main');
      });

      it('appRoot = "/"', () => {
         App.getRequest().getConfig().setState({appRoot: '/'});
         assert.equal(Data.getRelativeUrlWithService('/page/main'), '/page/main');
         assert.equal(Data.getRelativeUrlWithService('page/main'), 'page/main');
      });
      it('appRoot = "/service/"', () => {
         App.getRequest().getConfig().setState({appRoot: '/service/'});
         assert.equal(Data.getRelativeUrlWithService('/page/main'), '/service/page/main');
         assert.equal(Data.getRelativeUrlWithService('page/main'), '/service/page/main');
      });
   });
});

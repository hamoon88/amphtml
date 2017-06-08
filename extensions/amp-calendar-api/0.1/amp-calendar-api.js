/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Layout} from '../../../src/layout';

export class AmpCalendarApi extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.date = null;
    this.startingTime = null;
    this.endingTime = null;
    this.accessToken = null;
    this.queryString = null;
    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');
    this.registerAction('reload', this.reload.bind(this));
  }
  reload(arg) {
    this.date = arg.args.__AMP_OBJECT_STRING__.substr(1,10);
    this.buildCallback();
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  /** @override */
  buildCallback() {
    if(this.date === null){
      return;
    }
    this.container_.innerHTML = "";
    this.accessToken = this.getParameterByName('access_token');
    this.startingTime = this.date+"T00:00:00-04:00";
    this.endingTime = this.date+"T23:59:59-04:00";    
    this.queryString = "https://www.googleapis.com/calendar/v3/calendars/primary/events?"+
    "orderBy=startTime&showDeleted=false&singleEvents=true&timeMax="
    +this.endingTime+"&timeMin="+this.startingTime+"&fields=items%2Fsummary&access_token="+this.accessToken;
    var that = this;
    var response = fetch(this.queryString).then(
      function(response){
        response.json().then(
          body => {
            var summaries = 
              body["items"].map(function(item){
                return item["summary"];
              });
            for(var i in summaries) {
              var summary = summaries[i];
              newDiv = that.win.document.createElement('div');
              newDiv.style.width = "600px"
              newDiv.textContent = summary;
              that.container_.appendChild(newDiv);
            }
            //that.container_.textContent = summaries;
            that.element.appendChild(that.container_);
            that.applyFillContent(that.container_, /* replacedContent */ true);
          }
        );
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
}

AMP.registerElement('amp-calendar-api', AmpCalendarApi);

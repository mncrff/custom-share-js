window.onload = function(){

    CustomShare = (function() {

        var button = function(el, id) {
            var self = this;

            this.el = el;
            this.id = id;
            this.href = getAttr(this.el.getAttribute('href'), "");
            this.type = getType();
            this.param_url = getUrlParam();
            this.share_url = getShareUrl();
            this.show_count = getAttrBool(this.el.getAttribute('data-show-count'));

            this.el.className += ' ' + this.type + '-custom-share-button';
            this.el.setAttribute('id', this.type + "-" + id);
            this.el.innerHTML = '<span class="share-text">'+this.el.innerHTML+'</span>';

            //if the button has a set share url
            if (this.share_url) {
                //if the button does not have a url parameter or the url parameter value differs from the share url value
                if ( !this.param_url || (this.param_url !== this.share_url) ) {
                    //set the param value within the href string to the share url value
                    this.setUrlParam(this.share_url);
                }
            }

            //console.log(this.type +" : "+ this.share_url +" : "+ this.param_url);

            //if the button should show a count
            if (this.show_count) {
                /* get count by adding script to body 
                   that returns JSON with count stats 
                   via a callback */
                this.addScript();
            }

            //click event listener
            this.el.addEventListener('click', onTriggerEl);

            function onTriggerEl(e) {
                e.preventDefault();
                openPopup(self.href, 500, 370);
            }

            function openPopup(url, width, height) {
                var leftPosition, topPosition;
                //Allow for borders.
                leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
                //Allow for title and status bars.
                topPosition = (window.screen.height / 2) - ((height / 2) + 50);
                //Open the window.
                window.open(url, "Share Window", "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
            }

            function getAttr(attr, defaultValue) {
                return (typeof attr == 'undefined' || attr == null) ? defaultValue : attr;
            }

            function getAttrBool(attr) {
                return (typeof attr == 'undefined' || !attr || attr == 'false') ? false : true;
            }

            function getUrlFromParam(str, param) {
                var param = param + "=";
                var i = str.lastIndexOf(param);

                if (i < 0) {
                    return "";
                } else {
                    i += param.length;
                    return decodeURIComponent(str.substr(i));
                }
            }

            function getType() {
                var data = getAttr(self.el.getAttribute('data-type'), "");

                if (!data) {
                    if (self.href.lastIndexOf('facebook') > 0) {
                        return 'facebook';
                    } else if (self.href.lastIndexOf('twitter') > 0) {
                        return 'twitter';
                    } else if (self.href.lastIndexOf('linkedin') > 0) {
                        return 'linkedin';
                    } else {
                        return data;
                    }
                } else {
                    return data;
                }
            }

            function getUrlParam() {
                //check for a 'url' param, then try facebook's 'u' param...
                var param = getUrlFromParam(self.href, 'url');
                return !param ? getUrlFromParam(self.href, 'u') : param;
            }

            function getShareUrl() {
                var url = getAttr(self.el.getAttribute('data-share-url'), "");
                
                if (!url || url == "#") {
                    //check for url as a parameter on the href attribute                    

                    if (!self.param_url) {

                        //check for canonical url to use instead
                        if (!canonicalUrl) {
                            //if no canonical url exists, use window location as a last resort
                            return window.location.href;
                        } else {
                            return canonicalUrl;
                        }

                    } else {
                        return self.param_url;
                    }
                    
                } else {
                    return url;
                }
            }
        };

        button.prototype = {
            setUrlParam: function(url) {
                if (!this.param_url) {

                    var key = (this.type == 'facebook') ? 'u' : 'url',
                        param = encodeURIComponent(url),
                        new_href = this.href + (this.href.split('?')[1] ? '&':'?') + key + "=" + param;

                } else {

                    var param_url = encodeURIComponent(this.param_url),
                        new_url = encodeURIComponent(url),
                        new_href = this.href.replace(param_url, new_url);
                }

                this.el.setAttribute('href', new_href);
                this.href = new_href;
                this.param_url = url;
            },

            addScript: function() {
                //if the button should show a count
                if (this.type && this.type != 'twitter') {
                    var endpoint = "";
                    this.script = document.createElement('script');

                    switch(this.type) {
                        case 'facebook':
                            endpoint = "https://graph.facebook.com/?id="+this.share_url;
                            this.script.src = endpoint+"&callback=CustomShare.callbackFacebook";
                            break;
                        case 'linkedin':
                            endpoint = "https://www.linkedin.com/countserv/count/share?url="+this.share_url;
                            this.script.src = endpoint+"&callback=CustomShare.callbackLinkedin";
                            break;
                    }

                    this.el.parentNode.insertBefore(this.script, this.el.nextSibling);
                }
            }
        }

        var callbackFacebook = function(json){
            var btn = getCurrentScript().previousSibling;
            //add count element to the DOM
            addCount(btn, json.shares);
        }
        var callbackLinkedin = function(json){
            var btn = getCurrentScript().previousSibling;
            //add count element to the DOM
            addCount(btn, json.count);
        }

        var getCurrentScript = function() {
            return document.currentScript || (function() {
              var scripts = document.getElementsByTagName('script');
              return scripts[scripts.length - 1];
            })();
        }

        var addCount = function(btn, val) {
            var count_el = document.createElement('span');
            count_el.className = 'share-count';
            count_el.setAttribute('data-count', val);
            count_el.innerHTML = '<span style="margin: -1px; padding: 0; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip: rect(0, 0, 0, 0); position: absolute;">Number of Shares:</span> '+formatCount(val);
            btn.appendChild(count_el);
        }

        var formatCount = function(val) {
            if (val > 9999) {
                return Math.round(val/1000)+"k";
            } else if (val > 999) {
                return (Math.round(val/100) / 10)+"k";
            } else {
                return val;
            }
        }

        var getCanonicalUrl = function() {
            var canonical = "",
                links = document.getElementsByTagName("link");
                
            for (var i = 0; i < links.length; i ++) {
                if (links[i].getAttribute("rel") === "canonical") {
                    canonical = links[i].getAttribute("href");
                }
            }
            return canonical;
        }

        var selection = document.querySelectorAll('.custom-share-button'),
            canonicalUrl = getCanonicalUrl();
        
        buttonsList = Array.prototype.map.call(selection, function(el, i){
            return new button(el, i);
        });

        return {
            buttonsList: buttonsList,
            callbackFacebook: callbackFacebook,
            callbackLinkedin: callbackLinkedin
        };

    })();

};

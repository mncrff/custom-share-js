CustomShare = (function() {

	var selection = document.querySelectorAll('.custom-share-button');
	var buttonsList = [];

	var button = function(el, id) {
		var self = this;

		this.el = el;
		this.id = id;
		this.type = getAttr(this.el.getAttribute('data-type'), "");
		this.href = getAttr(this.el.getAttribute('href'), "");
		this.share_url = getAttr(this.el.getAttribute('data-share-url'), "");
		this.show_count = getAttr(this.el.getAttribute('data-count'), "");

		this.el.className += ' ' + this.type + '-custom-share-button';
		this.el.setAttribute('id', this.type + "-" + id);

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
	};

	button.prototype = {
		addScript: function() {
			//if the button should show a count
			if (this.type && this.type != 'twitter') {
				var endpoint = "";
				this.script = document.createElement('script');

				switch(this.type) {
					case 'facebook':
						endpoint = "https://graph.facebook.com/?id=http://www.microsoft.com";
						this.script.src = endpoint+"&callback=CustomShare.callbackFacebook";
						break;
					case 'linkedin':
						endpoint = "https://www.linkedin.com/countserv/count/share?url=http://www.microsoft.com";
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
		count_el.setAttribute('data-val', val);
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

	// window.onload = function(){
	buttonsList = Array.prototype.map.call(selection, function(el, i){
		return new button(el, i);
	});
	//};

	// more than one object
	return {
		buttonsList: buttonsList,
		callbackFacebook: callbackFacebook,
		callbackLinkedin: callbackLinkedin
	};

})();
function customShareButton(el) {
	var button = this;

	this.el = el;
	this.type = getAttr(this.el.getAttribute('data-type'), null);
	this.href = getAttr(this.el.getAttribute('href'), "");
	this.count_url = getAttr(this.el.getAttribute('data-count-url'), "");
	this.count = 0;
	this.count_el = null;

	this.el.className += ' ' + this.type + '-custom-share-button';

	//if the button should show a count
	if (this.count_url) {
		//add count element to the DOM
		this.count_el = document.createElement('span');
		this.count_el.className += ' share-count';
		this.el.appendChild(this.count_el);
	}
	//update count
	this.updateCount();

	//click event listener
	this.el.addEventListener('click', onTriggerEl);

	function onTriggerEl(e) {
		e.preventDefault();
		openPopup(button.href, 500, 370);
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
}

customShareButton.prototype.updateCount = function() {
	//if the button should show a count
	if (this.count_url) {
		var endpoint = '';

		switch(this.type) {
			case 'facebook':
				endpoint = "http://graph.facebook.com/?id=http://www.microsoft.com";
				break;
			case 'twitter':
				endpoint = "http://urls.api.twitter.com/1/urls/count.json?url=http://www.microsoft.com";
				break;
			case 'linkedin':
				endpoint = "http://www.linkedin.com/countserv/count/share?url=http://www.microsoft.com";
				break;
		}
		
		//set count as text inside button
		this.count_el.textContent = this.count;
	}
}

function testCallback(result) {
	console.log(result);
	result.shares && console.log('The count is: ', result.shares);
}

window.onload = function(){
	var sharebtns = document.querySelectorAll('.custom-share-button');

	window.Share = Array.prototype.map.call(sharebtns, function(el, i){
		return new customShareButton(el);
	});
}
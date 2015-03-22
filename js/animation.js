window.onload = function(){
	
var controller = new ScrollMagic();

	var tween = TweenMax.fromTo(".test", 1,
								{left: -1000},
								{left: 0, ease: Circ.easeInOut}
							);


	// build scene
	var scene = new ScrollMagic.Scene({triggerElement: "#home .main", triggerHook: 'onEnter', offset: 1000})
					.setTween(tween)
					.addIndicators() 
					.addTo(controller);
}


	
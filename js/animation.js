window.onload = function(){
	
	
 /*TweenLite.to(".test", 10, {left:600}); 
	
	var controller = new ScrollMagic();

	var tween = TweenMax.fromTo(".slytherin", 1,
								{left: -1000},
								{left: 0, ease: Circ.easeInOut}
							);

	// build scene
	var scene = new ScrollMagic.Scene(triggerElement: "#sect2")
					.setTween(tween)
					.addIndicators() 
					.addTo(controller); */
	
					var scene = new ScrollMagic.Scene({
									triggerElement: "#slytherin"
								})
								.setTween("#blah", 0.5, {backgroundColor: "green", scale: 2.5}) // trigger a TweenMax.to tween
								.addIndicators({name: "1 (duration: 0)"}) // add indicators (requires plugin)
								.addTo(controller);
	
	
}


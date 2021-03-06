// Copyright (c) %%year%% by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: %%version%%

(function(window, klass, Util){
	
	
	Util.registerNamespace('Code.PhotoSwipe.TouchElement');
	var PhotoSwipe = window.Code.PhotoSwipe;
	
	
	PhotoSwipe.TouchElement.TouchElementClass = klass({
		
		
		
		el: null,
		touchSettings: null,
		touchStartPoint: null,
		touchEndPoint: null,
		touchStartTime: null,
		doubleTapTimeout: null,
		
		touchStartHandler: null,
		touchMoveHandler: null,
		touchEndHandler: null,
		
		mouseDownHandler: null,
		mouseMoveHandler: null,
		mouseUpHandler: null,
		mouseOutHandler: null,
		
		gestureStartHandler: null,
		gestureChangeHandler: null,
		gestureEndHandler: null,
		
		
		
		
		/*
		 * Function: initialize
		 */
		initialize: function(options){
			
			this.touchSettings = {
				swipeThreshold: 50,
				swipeTimeThreshold: 250,
				doubleTapSpeed: 250
			};
			
			Util.extend(this.touchSettings, options);
			
			this.touchStartPoint = { x: 0, y: 0 };
			this.touchEndPoint = { x: 0, y: 0 };
			
		},
		
		
		
		/*
		 * Function: addEventHandlers
		 */
		addEventHandlers: function(){
		
			if (Util.isNothing(this.touchStartHandler)){
				this.touchStartHandler = this.onTouchStart.bind(this);
				this.touchMoveHandler = this.onTouchMove.bind(this);
				this.touchEndHandler = this.onTouchEnd.bind(this);
				this.mouseDownHandler = this.onMouseDown.bind(this);
				this.mouseMoveHandler = this.onMouseMove.bind(this);
				this.mouseUpHandler = this.onMouseUp.bind(this);
				this.mouseOutHandler = this.onMouseOut.bind(this);
				this.gestureStartHandler = this.onGestureStart.bind(this);
				this.gestureChangeHandler = this.onGestureChange.bind(this);
				this.gestureEndHandler = this.onGestureEnd.bind(this);
			}
			
			Util.Events.add(this.el, 'touchstart', this.touchStartHandler);
			Util.Events.add(this.el, 'touchmove', this.touchMoveHandler);
			Util.Events.add(this.el, 'touchend', this.touchEndHandler);
			
			Util.Events.add(this.el, 'mousedown', this.mouseDownHandler);
			
			if (Util.Browser.isGestureSupported){
				Util.Events.add(this.el, 'gesturestart', this.gestureStartHandler);
				Util.Events.add(this.el, 'gesturechange', this.gestureChangeHandler);
				Util.Events.add(this.el, 'gestureend', this.gestureEndHandler);
			}
			
		},
		
		
		
		/*
		 * Function: removeEventHandlers
		 */
		removeEventHandlers: function(){
			
			Util.Events.remove(this.el, 'touchstart', this.touchStartHandler);
			Util.Events.remove(this.el, 'touchmove', this.touchMoveHandler);
			Util.Events.remove(this.el, 'touchend', this.touchEndHandler);
			Util.Events.remove(this.el, 'mousedown', this.mouseDownHandler);
			
			if (Util.Browser.isGestureSupported){
				Util.Events.remove(this.el, 'gesturestart', this.gestureStartHandler);
				Util.Events.remove(this.el, 'gesturechange', this.gestureChangeHandler);
				Util.Events.remove(this.el, 'gestureend', this.gestureEndHandler);
			}
			
		},
		
		
		
		/*
		 * Function: getTouchPoint
		 */
		getTouchPoint: function(touches){
			
			return {
				x: touches[0].pageX,
				y: touches[0].pageY
			};
			
		},
		
		
		
		/*
		 * Function: fireTouchEvent
		 */
		fireTouchEvent: function(){
			
			var 
				action,
				distX = 0,
				distY = 0,
				dist = 0,
				self,
				endTime,
				diffTime;

			distX = this.touchEndPoint.x - this.touchStartPoint.x;
			distY = this.touchEndPoint.y - this.touchStartPoint.y;
			dist = Math.sqrt( (distX * distX) + (distY * distY) );
			
			endTime = new Date();
			diffTime = endTime - this.touchStartTime;
			
			// See if there was a swipe gesture
			if (diffTime <= this.touchSettings.swipeTimeThreshold){
				
				if (window.Math.abs(distX) >= this.touchSettings.swipeThreshold){
				
					Util.Events.fire(this, { 
						type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
						target: this, 
						point: this.touchEndPoint,
						action: (distX < 0) ? PhotoSwipe.TouchElement.ActionTypes.swipeLeft : PhotoSwipe.TouchElement.ActionTypes.swipeRight
					});
					return;
					
				}
				
				
				if (window.Math.abs(distY) >= this.touchSettings.swipeThreshold){
					
					Util.Events.fire(this, { 
						type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
						target: this, 
						point: this.touchEndPoint,
						action: (distY < 0) ? PhotoSwipe.TouchElement.ActionTypes.swipeUp : PhotoSwipe.TouchElement.ActionTypes.swipeDown
					});
					return;
				
				}
				
			}
			
			
			if (dist > 1){
				Util.Events.fire(this, { 
					type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
					target: this, 
					action: PhotoSwipe.TouchElement.ActionTypes.touchEnd,
					point: this.touchEndPoint
				});
				return;
			}
			
			
			if (Util.isNothing(this.doubleTapTimeout)){
				
				self = this;
				this.doubleTapTimeout = window.setTimeout(function(){
					
					self.doubleTapTimeout = null;
					
					Util.Events.fire(self, { 
						type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
						target: self, 
						point: this.touchEndPoint,
						action: PhotoSwipe.TouchElement.ActionTypes.tap
					});
					
				}, this.touchSettings.doubleTapSpeed);
				
				return;
				
			}
			else{
				
				window.clearTimeout(this.doubleTapTimeout);
				this.doubleTapTimeout = null;
			
				Util.Events.fire(this, { 
					type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
					target: this, 
					point: this.touchEndPoint,
					action: PhotoSwipe.TouchElement.ActionTypes.doubleTap
				});
				
			}
			
		},
		
		
		
		/*
		 * Function: onTouchStart
		 */
		onTouchStart: function(e){
		
			e.preventDefault();
			
			// No longer need mouse events
			Util.Events.remove(this.el, 'mousedown', this.mouseDownHandler);
			
			var 
				touchEvent = Util.Events.getTouchEvent(e),
				touches = touchEvent.touches;
			
			if (touches.length > 1){
				this.isGesture = true;
				return;
			}
			
			this.touchStartTime = new Date();
			this.isGesture = false;
			this.touchStartPoint = this.getTouchPoint(touches);
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.touchStart,
				point: this.touchStartPoint
			});
			
		},
		
		
		
		/*
		 * Function: onTouchMove
		 */
		onTouchMove: function(e){
		
			e.preventDefault();
			
			if (this.isGesture){
				return;
			}
			
			var 
				touchEvent = Util.Events.getTouchEvent(e),
				touches = touchEvent.touches;
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.touchMove,
				point: this.getTouchPoint(touches)
			});
			
		},
		
		
		
		/*
		 * Function: onTouchEnd
		 */
		onTouchEnd: function(e){
			
			if (this.isGesture){
				return;
			}
			
			e.preventDefault();
			
			// http://backtothecode.blogspot.com/2009/10/javascript-touch-and-gesture-events.html
			// iOS removed the current touch from e.touches on "touchend"
			// Need to look into e.changedTouches
			
			var 
				touchEvent = Util.Events.getTouchEvent(e),
				touches = (!Util.isNothing(touchEvent.changedTouches)) ? touchEvent.changedTouches : touchEvent.touches;
			
			this.touchEndPoint = this.getTouchPoint(touches);
			
			this.fireTouchEvent();
			
		},
		
		
		
		/*
		 * Function: onMouseDown
		 */
		onMouseDown: function(e){
			
			e.preventDefault();
			
			// No longer need touch events
			Util.Events.remove(this.el, 'touchstart', this.mouseDownHandler);
			Util.Events.remove(this.el, 'touchmove', this.touchMoveHandler);
			Util.Events.remove(this.el, 'touchend', this.touchEndHandler);
			
			// Add move/up/out
			Util.Events.add(this.el, 'mousemove', this.mouseMoveHandler);
			Util.Events.add(this.el, 'mouseup', this.mouseUpHandler);
			Util.Events.add(this.el, 'mouseout', this.mouseOutHandler);
			
			this.touchStartTime = new Date();
			this.isGesture = false;
			this.touchStartPoint = Util.Events.getMousePosition(e);
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.touchStart,
				point: this.touchStartPoint
			});
			
		},
		
		
		
		/*
		 * Function: onMouseMove
		 */
		onMouseMove: function(e){
			
			e.preventDefault();
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.touchMove,
				point: Util.Events.getMousePosition(e)
			});
			
		},
		
		
		
		/*
		 * Function: onMouseUp
		 */
		onMouseUp: function(e){
			
			e.preventDefault();
			
			Util.Events.remove(this.el, 'mousemove', this.mouseMoveHandler);
			Util.Events.remove(this.el, 'mouseup', this.mouseUpHandler);
			Util.Events.remove(this.el, 'mouseout', this.mouseOutHandler);
			
			this.touchEndPoint = Util.Events.getMousePosition(e);
			
			this.fireTouchEvent();
		
		},
		
		
		
		/*
		 * Function: onMouseOut
		 */
		onMouseOut: function(e){
			
			e.preventDefault();
			
			Util.Events.remove(this.el, 'mousemove', this.mouseMoveHandler);
			Util.Events.remove(this.el, 'mouseup', this.mouseUpHandler);
			Util.Events.remove(this.el, 'mouseout', this.mouseOutHandler);
			
			this.touchEndPoint = Util.Events.getMousePosition(e);
			
			this.fireTouchEvent();
			
		},
		
		
		
		/*
		 * Function: onGestureStart
		 */
		onGestureStart: function(e){
		
			e.preventDefault();
			
			var touchEvent = Util.Events.getTouchEvent(e);
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.gestureStart,
				scale: touchEvent.scale,
				rotation: touchEvent.rotation
			});
		
		},
		
		
		
		/*
		 * Function: onGestureChange
		 */
		onGestureChange: function(e){
		
			e.preventDefault();
			
			var touchEvent = Util.Events.getTouchEvent(e);
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.gestureChange,
				scale: touchEvent.scale,
				rotation: touchEvent.rotation
			});
			
		},
		
		
		
		/*
		 * Function: onGestureEnd
		 */
		onGestureEnd: function(e){
		
			e.preventDefault();
			
			var touchEvent = Util.Events.getTouchEvent(e);
			
			Util.Events.fire(this, { 
				type: PhotoSwipe.TouchElement.EventTypes.onTouch, 
				target: this, 
				action: PhotoSwipe.TouchElement.ActionTypes.gestureEnd,
				scale: touchEvent.scale,
				rotation: touchEvent.rotation
			});
			
		}
		
		
		
	});
	
	
	
}
(
	window, 
	window.klass, 
	window.Code.Util
));
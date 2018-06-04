/**
 * Observe elements to see if they are (or have ever been) within the viewport
 *  $('.panel').observe(function(){ ... });
 * @author   Ryan Boylett <http://boylett.uk/>
 * @version  0.1.0
 */

;(function()
{
	if(!jQuery)
	{
		throw new Error('jQuery not found');
	}

	var doc            = jQuery(document),
		win            = jQuery(window),
		html           = jQuery(document.documentElement || 'html'),
		body           = jQuery(document.body || 'body'),
		scrollTop      = 0,
		documentHeight = 0,
		windowHeight   = window.innerHeight || 0,
		observing      = [];

	function calculate(event)
	{
		scrollTop = doc.scrollTop() || win.scrollTop() || 0;

		if(scrollTop > 2)
		{
			if(!html.hasClass('scrolled-past-top'))
			{
				html.addClass('scrolled-past-top');

				doc.trigger('scrolled-past-top');
			}
		}
		else
		{
			if(html.hasClass('scrolled-past-top'))
			{
				html.removeClass('scrolled-past-top');

				doc.trigger('scrolled-to-top');
			}
		}

		if(scrollTop > windowHeight)
		{
			if(!html.hasClass('scrolled-past-viewport'))
			{
				html.addClass('scrolled-past-viewport');

				doc.trigger('scrolled-past-viewport');
			}
		}
		else
		{
			if(html.hasClass('scrolled-past-viewport'))
			{
				html.removeClass('scrolled-past-viewport');

				doc.trigger('scrolled-to-viewport');
			}
		}

		if((scrollTop + windowHeight) >= (documentHeight - 2))
		{
			if(!html.hasClass('scrolled-to-bottom'))
			{
				html.addClass('scrolled-to-bottom');

				doc.trigger('scrolled-to-bottom');
			}
		}
		else
		{
			if(html.hasClass('scrolled-to-bottom'))
			{
				html.removeClass('scrolled-to-bottom');

				doc.trigger('scrolled-past-bottom');
			}
		}

		if(observing.length > 0)
		{
			for(var i = 0; i < observing.length; i ++)
			{
				var element = observing[i][0],
					bounds  = observing[i][1];

				if(element && element.length != undefined && element.length > 0)
				{
					if(!bounds)
					{
						bounds          =
						observing[i][1] =
						{
							height: element.outerHeight(),
							offset: element.offset()
						};
					}

					scrollBottom  = scrollTop + windowHeight;
					elementTop    = bounds.offset.top,
					elementBottom = elementTop + bounds.height;
					elementMiddle = elementTop + bounds.height / 2;

					if(scrollBottom > elementMiddle && elementMiddle > scrollTop)
					{
						if(!element.hasClass('over-half-within-viewport'))
						{
							element.addClass('over-half-within-viewport');

							element.trigger('enter-half-viewport');
						}
					}
					else
					{
						if(element.hasClass('over-half-within-viewport'))
						{
							element.removeClass('over-half-within-viewport');

							element.trigger('leave-half-viewport');
						}
					}

					if(scrollBottom > elementTop && elementBottom > scrollTop)
					{
						if(!element.hasClass('observed'))
						{
							element.addClass('observed');

							element.trigger('observed');
						}

						if(!element.hasClass('within-viewport'))
						{
							element.addClass('within-viewport');

							element.trigger('enter-viewport');
						}
					}
					else
					{
						if(element.hasClass('within-viewport'))
						{
							element.removeClass('within-viewport');

							element.trigger('leave-viewport');
						}
					}
				}
			}
		}
	}

	function refresh(event)
	{
		documentHeight = doc.height();
		windowHeight   = win.height();

		if(observing.length > 0)
		{
			for(var i = 0; i < observing.length; i ++)
			{
				if(observing[i][0] && observing[i][0].length != undefined && observing[i][0].length > 0)
				{
					observing[i][1] =
					{
						height: observing[i][0].outerHeight(),
						offset: observing[i][0].offset()
					};
				}
				else
				{
					delete observing[i];
				}
			}
		}
	}

	jQuery.fn.observe = function(callback)
	{
		html
			.not('.has-observers')
			.addClass('has-observers');

		return jQuery(this)
			.addClass('observing')
			.each(function()
			{
				element = jQuery(this);

				observing.push([element, null]);

				if(callback !== undefined)
				{
					if(typeof callback == 'function')
					{
						element.on('observed', callback);
					}
					else if(typeof callback == 'object')
					{
						if(callback['enter-half-viewport'] !== undefined && typeof callback['enter-half-viewport'] == 'function')
						{
							element.on('enter-half-viewport', callback['enter-half-viewport']);
						}

						if(callback['enter-viewport'] !== undefined && typeof callback['enter-viewport'] == 'function')
						{
							element.on('enter-viewport', callback['enter-viewport']);
						}

						if(callback['leave-half-viewport'] !== undefined && typeof callback['leave-half-viewport'] == 'function')
						{
							element.on('leave-half-viewport', callback['leave-half-viewport']);
						}

						if(callback['leave-viewport'] !== undefined && typeof callback['leave-viewport'] == 'function')
						{
							element.on('leave-viewport', callback['leave-viewport']);
						}

						if(callback['observed'] !== undefined && typeof callback['observed'] == 'function')
						{
							element.on('observed', callback['observed']);
						}

						if(callback['unobserved'] !== undefined && typeof callback['unobserved'] == 'function')
						{
							element.on('unobserved', callback['unobserved']);
						}
					}
				}
			});
	};

	jQuery.fn.unobserve = function()
	{
		var new_observing = [],
			list          = jQuery(this)
				.removeClass('observing')
				.each(function()
				{
					var element = jQuery(this);

					for(var i = 0; i < observing; i ++)
					{
						if(element.is(observing[i][0]))
						{
							element.trigger('unobserved');
						}
						else
						{
							new_observing.push(observing[i]);

							continue;
						}
					}
				});

		observing = new_observing;

		if(observing.length == 0)
		{
			html.removeClass('has-observers');
		}

		return list;
	};

	jQuery(function()
	{
		jQuery('.observe').observe();

		doc.on('scroll', calculate);
		win.on('orientationchange resize', refresh);

		refresh();
		calculate();
	});
})();

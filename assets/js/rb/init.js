(function($, window, document, undefined) {
    var duration = 200;

    // Platzhalter ueber dem Inhalt mit der Groesse der Cookie-Bar integrieren
    // wenn diese Vorhanden ist.

    var $cookieBar = $('.cookie-bar');
    var $cookieBarPlaceholder = $('<div class="cookie-bar-placeholder"/>').
        prependTo('#wrapper').
        css({ height: $cookieBar.outerHeight(), position: 'relavtive', marginTop: 0 });
    var cookieSettingsOpenedFromPortalSwitch = false;

    $('.cookie-status > span.icon').on('click', function() {
        cookieSettingsOpenedFromPortalSwitch = true;
        $(window).trigger('open.rb-slide-out', ['cookie-settings', this]);
    });

    $cookieBar.on('click', function() {
        return false;
    });

    var isAndroidBrowser = $('html').hasClass('android-browser');

    $(window).
        on('opening.rb-slide-out', function(evt, trigger, name) {
            // Cookie-Bar verstecken wenn die Cookie-Settings geoeffnet werden
            if(name === 'cookie-settings') {
                $(window).trigger('close.rb-slide-out', ['cookie-bar']);
            // Cookie-Bar-Platzhalter parallel zur Cookie-Bar anzeigen wenn diese
            // geoeffnet wird.
            } else if(name === 'cookie-bar') {
                $cookieBarPlaceholder.show().css({
                    height: $cookieBar.outerHeight(),
                    marginTop: -$cookieBar.outerHeight()
                }).animate({ marginTop: 0 }, 500, 'linear');
            }
        }).
        on('opened.rb-slide-out', function(evt, trigger, name) {
            // Wenn die Cookie-Settings offen sind dann die Overflow-Klasse
            // im Body setzen. Das gilt fuer alle Browser bis auf den Stock-
            // Browser von Android.
            if(name === 'cookie-settings') {
                if(!isAndroidBrowser) {
                    $('body').addClass('cookie-settings-open');
                }
            // Cookie-Bar-Platzhalter in Hoehe und Position nach dem ausklappen
            // der Cookie-Bar finalisieren.
            } else if(name === 'cookie-bar') {
                $cookieBarPlaceholder.show().css({
                    height: $cookieBar.outerHeight(),
                    marginTop: 0
                });
            }
        }).
        on('closing.rb-slide-out', function(evt, trigger, name) {
            // Wenn die Cookie-Bar geschlossen wird dann auch den Platzhalter
            // parallel dazu animiert ausblenden.
            if(name === 'cookie-bar') {
                $cookieBarPlaceholder.css({
                    height: $cookieBar.outerHeight(),
                    marginTop: 0
                }).animate({ marginTop: -$cookieBar.outerHeight() }, 500, 'linear');
            // Auf Desktop-Browsern sofort die Klasse dass die Settings geoeffnet
            // sind entfernen um einen Ruck am Ende der Animation zu vermeiden.
            } else if(name === "cookie-settings" && !RB.support.touch) {
                $('body').removeClass('cookie-settings-open');
            }

            if(trigger !== null) {
                if( !$(trigger).hasClass('cookie-slider-save') && !cookieSettingsOpenedFromPortalSwitch) {
                    $(window).trigger('open.rb-slide-out', ['cookie-bar']);
                }
                if($(trigger).hasClass('open-cookie-settings')) {
                    $(window).trigger('open.rb-slide-out', ['cookie-settings']);
                }
            }
        }).
        on('closed.rb-slide-out', function(evt, trigger, name) {
            // Nach dem Schliessen der Cookie-Bar den dazugehoerigen Platzhalter
            // ebenfalls final ausblenden.
            if(name === 'cookie-bar') {
                $cookieBarPlaceholder.css({
                    height: $cookieBar.outerHeight(),
                    marginTop: -$cookieBar.outerHeight()
                }).hide();
            // Auf Touchscreen-Geraeten (und nicht dem Android-Browser) die
            // Cookie-Settings-Open-Klasse erst am Ende entfernen.
            } else if(name === "cookie-settings" && RB.support.touch) {
                if(!isAndroidBrowser) {
                    $('body').removeClass('cookie-settings-open');
                }
            }
        }).
        on('resize', function() {
            if($cookieBarPlaceholder.css('display') !== 'none' && parseFloat($cookieBarPlaceholder.css('margin-top')) === 0) {
                $cookieBarPlaceholder.css('height', $cookieBar.outerHeight());
            }
        });

    // Klasse am Body beim Oeffnen eines Elementes im Hauptmenues hinzufuegen

    $(window).
        on('open.navigation open.search open.login open.settings', function(evt) {
            // der Header ist im Android-Browser nicht (mehr) fixiert, daher 
            // wird die Klasse nicht gebraucht.
            if(!isAndroidBrowser) {
                $('body').addClass('mainmenu-open');
            }
        }).
        on('close.navigation close.search close.login close.settings', function(evt) {
            // der Header ist im Android-Browser nicht (mehr) fixiert, daher 
            // wird die Klasse nicht gebraucht.
            if(!isAndroidBrowser) {
                $('body').removeClass('mainmenu-open');
            }
        });

    if(isAndroidBrowser) {
        $(window).on('showing.rb-overlay', function(evt) {
            if(evt.namespace === 'rb-overlay') {
                $('.rb-overlay,[data-rb-overlay]').css({ 
                    right  : '', 
                    bottom : '', 
                    width  : $(document).width(), 
                    height : $(document).height() 
                });
            }
        });
    }

    var hasScrollClass = false;

    $(window).on('load resize', function() {
        var scrollbars = window.innerWidth - $('body').width() > 5;

        if(!hasScrollClass && scrollbars) {
            $('html').addClass('scrollbars');
            hasScrollClass = true;
        } else if(hasScrollClass  && !scrollbars) {
            $('html').removeClass('scrollbars');
            hasScrollClass = false;
        }
    });
    
    var scrollClassAdded = false;
    
    $(window).on('closed.rb-slide-out', function(evt, trigger, name) {
        if(name === 'cookie-bar') {
            $(window).trigger('update.rb-expand');
        }
    });

    // der Header ist im Android-Browser nicht (mehr) fixiert.
    
    $(window).on('scroll', function(evt) {
        if($(window).scrollTop() > 10) {
            if(!scrollClassAdded) {
                if(!isAndroidBrowser) {
                    $('header').addClass('compact');
                }

                scrollClassAdded = true;

                window.setTimeout(function() {
                    $(window).trigger('update.rb-expand');
                }, 300);
            }
        } else if(scrollClassAdded) {
            if(!isAndroidBrowser) {
                $('header').removeClass('compact');
            }

            scrollClassAdded = false;
            
            window.setTimeout(function() {
                $(window).trigger('update.rb-expand');
            }, 300);
        }
    });

    if(!isAndroidBrowser) {
        if($(window).scrollTop() > 10) {
            $('header').addClass('compact');
            scrollClassAdded = true;
        }
    }

    if(isAndroidBrowser) {
        // WTF-Hack: Auf Android-Browsern ohne fixiertem Header muss alles
        // was mit dem Header zu tun hat aus den Optionen des rb-expand- und 
        // rb-jump-Widgets entfernt werden damit die Hoehenberechnung und die 
        // Sprungposition wieder stimmt...
        var replaceRegex = /header,|,\s*header|\.cookie-bar,|,\s*\.cookie-bar/gi;
        var replaceEnd = /header\s*;|\.cookie-bar;/gi;
        
        $('[data-rb-expand*=header],[data-rb-jump*=header]').each(function() {
            var attribute = $(this).is('[data-rb-expand]') ? 'data-rb-expand' : 'data-rb-jump';
            var value = $(this).attr(attribute);

            value = value.replace(replaceRegex, '');
            value = value.replace(replaceEnd, ';');

            $(this).attr(attribute, value);
        });
    }

    // iOS-Bugs mit fixierten Elementen angreifen...
    if($('html').hasClass('ios-safari')) {
        $('input:not([type="checkbox"],[type="radio"]),textarea,select').
            on('focus', function() {
                $('html').addClass('ios-keyboard-active');
            }).
            on('blur', function() {
                $('html').removeClass('ios-keyboard-active');
            });
    }

})(jQuery, window, document);
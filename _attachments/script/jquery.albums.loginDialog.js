(function( $ ) {

  $.widget( "albums.loginDialog", {
    
    options: {
      state: 0, // 0 - log in state. 1 - sign up state.
      loginText: "Log In",
      signUpText: "Sign Up"
    },
    
    _create: function() {
      var ops = this.options;
      var $element = this.element;
      
      // Current page reference.
      var currentPage = $.mobile.activePage;
      var pageLink = currentPage.attr( "id" );
      // It is an internal page link.
      if( pageLink.indexOf( ".html" ) == -1 ) pageLink = "#" + pageLink;
      var closeButton = $element.find( "div[class*='ui-header'] a#dialogCloseButton" )
                                .attr( "href", pageLink );
      // Hold reference in custom data expando.
      $element.data("previous", pageLink );
      
      // Wrap the content in a dialog page.
      var wrapper = this._wrapDialog( $element );
      // Wire interactions.
      this._wire();
      this._changeState( ops.state );
      // For some reason, i have to add it to the DOM in order to changePage() to it.
      $("body[class*=\"ui-mobile-viewport\"]").append(wrapper);
      $.mobile.changePage( [currentPage, wrapper], "slide", false );
    },
    
    _setOption: function( key, value ) {
      this._changeState( ( key == "state" ) ? value : this.options.state );
      jQuery.Widget.prototype._setOption.apply( this, arguments );
    },
    
    _wrapDialog: function( dialogElement ) {
      // Page wrapper usually created on external page.
      var dialogPage = $("<div data-role=\"page\">");
      dialogPage.append( dialogElement );
      dialogPage.page();
      
      dialogPage.bind( "pagebeforeshow", function() {
          dialogPage.unbind( "pagebeforeshow" );
          var h = parseFloat(dialogPage.innerHeight());
          h -= ( parseFloat(dialogElement.css("border-top-width")) + parseFloat(dialogElement.css("border-bottom-width")) );
          // define the height based on innerHeight of wrapping parent page and the border styles applied to a dialog.
          dialogElement.css( "height", h + "px" );
      });
      dialogPage.bind( "pagehide", function() {
          dialogPage.unbind( "pagehide" );
          dialogPage.empty();
          dialogPage.remove();
      });
      return dialogPage;
    },
    
    _changeState: function( state ) {
      var mainText = ( state == 0 ) ? this.options.loginText : this.options.signUpText;
      var optionText = ( state == 0 ) ? this.options.signUpText : this.options.loginText;
      var $element = this.element;
      var header = $element.find( "div[class*='ui-header']" );
      var page = $element.find( "div[data-role='content']" );
      var title = header.find( "[class*='ui-title']" );
      var optionLinkButton =  page.find( "#optionLinkButton" );
      var submitButton = page.find( "a[aria-label='submit']" );
      title.html( mainText );
      optionLinkButton.html( optionText + "?" );
      submitButton.html( mainText );
      submitButton.buttonMarkup();
    },
    
    _wire: function() {
      var ref = this;
      var $element = ref.element;
      var ops = ref.options;
      var page = $element.find("div[data-role='content']");
      var optionLinkButton = page.find( "#optionLinkButton" );
      
      optionLinkButton.bind( "click", function(event) {
        event.preventDefault();
        // toggle state.
        ref._setOption( "state", ( ops.state == 1 ) ? 0 : 1 );
        return false;
      });
      
      $element.bind( "submit", function(event) {
        event.preventDefault();
        var username = $element.find( "input#username" ).val();
        var password = $element.find( "input#password" ).val();
        var uievent = ( ops.state == 0 ) ? "login" : "signup";
        var ui = {name:username, password:password};
        ref._trigger( uievent, {type:uievent}, ui );
        return false;
      });
    },
    
    _unwire: function() {
      var $element = this.element;
      var page = $element.find( "div[data-role='content']" );
      var optionLinkButton =  page.find( "#optionLinkButton" );
      optionLinkButton.unbind( "click" );
      $element.unbind( "submit" );
    },
    
    close: function() {
      var $element = this.element;
      this._trigger( "close", {type:"close"} );
      $.mobile.changePage( $element.data("previous"), undefined, false );
    },
    
    destroy: function() {
      this._unwire();
      // jQuery Mobile keeps adding a Submit button substitue to the template upon show,
      // Lets remove it here.
      var $element = this.element;
      var page = $element.find( "div[data-role='content']" );
      var submitButton = page.find( "a[aria-label='submit']" );
      submitButton.remove();
      // super destroy.
      jQuery.Widget.prototype.destroy.call( this );
      this.element = null;
    }
    
  });

})(jQuery)
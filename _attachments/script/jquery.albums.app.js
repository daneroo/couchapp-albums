(function($) {
  
  $.albums = $.albums || {};
  $.extend( $.albums, {
    
    dialog: undefined,
    database: undefined,
    
    logIn: function( name, password, options ) {
      doLogIn( name, password, options );
    },
    
    logOut: function( options ) {
      doLogOut( options );
    },
    
    saveDocument: function( document, options ) {
      checkSession( {
        available: function( userCtx ) {
          document.user = user;
          $.albums.database.saveDoc( document, options );
        },
        unavailable: function() {
          showDialog( options );
        }
      });
    },
    
    deleteDocument: function( document, options ) {
      checkSession( {
        available: function( userCtx ) {
          $.albums.database.removeDoc( document, options );
        },
        unavailable: function() {
          showDialog( options );
        }
      });
    }
    
  });
  
  var user; /* _user > document.name */
  
  function OpenUserDocCommand( target, args, options ) {}
  OpenUserDocCommand.prototype = new Command();
  OpenUserDocCommand.prototype.execute = function( data ) {
      var $userDB = $.couch.db("_users");
      $userDB.openDoc( data.id, this.getCommandOptions( this.options, this.nextCommand ) );
  }
  
  function AssignRoleCommand( target, args, options ) {}
  AssignRoleCommand.prototype = new Command();
  AssignRoleCommand.prototype.execute = function( data ) {
      data.roles = ["albums-user"];
      var $userDB = $.couch.db("_users");
      $userDB.saveDoc( data, this.getCommandOptions( this.options, this.nextCommand ) );
  }
  
  function checkSession( options ) {
    options = options || {};
    $.couch.session( {
      success: function( response ) {
        var context = response.userCtx;
        if( context.name == null ) {
          if( options.unavailable ) options.unavailable();
        }
        else{
          if( options.available ) options.available( context );
        }
      },
      error: function( status, error, reason ) {
        if( options.unavailable ) options.unavailable();
      }
    });
  }
  
  function doLogIn( name, password, options ) {
    options = options || {};
    var loginObj = {
      name:name,
      password:password,
      success: function( response ) {
        user = response.name;
        if( options.success ) options.success( response );
      },
      error: function( status, error, reason ) {
        if( options.error ) options.error( status, error, reason );
      }
    };
    $.couch.login( loginObj );
  }
  
  function doLogOut( options ) {
    options = options || {};
    $.couch.logout( {
      success: function( response ) {
        user = undefined;
        if( options.success ) options.success( response );
      },
      error: function( status, error, reason ) {
        if( options.error ) options.error( status, error, reason );
      }
    })
  }
  
  function doSignUp( name, password, options ) {
    options = options || {};
    var queueOptions = {
      complete: function() {
        if( options.success ) options.success();
      }
    }
    // Change username:password to your CouchDB admin credentials.
    var queue = new Queue( queueOptions );
    queue.addCommand( new Command( $.albums.logIn, ["username", "password"] ) );
    queue.addCommand( new Command( $.couch.signup, [{name:name}, password] ) );
    queue.addCommand( new OpenUserDocCommand() );
    queue.addCommand( new AssignRoleCommand() );
    queue.addCommand( new Command( $.albums.logOut ) );
    queue.addCommand( new Command( $.albums.logIn, [name, password], options ) );
    queue.execute();
  }
  
  function showDialog( options ) {
    $.albums.dialog.loginDialog( {
      login: function( evt, ui ) {
        doLogIn( ui.name, ui.password, {
          success: function( response ) {
            $.albums.dialog.loginDialog( "close" );
          },
          error: function( status, error, reason ) {
            alert( "Error: " + error + ", " + reason );
          }
        });
      },
      signup: function( evt, ui ) {
        doSignUp( ui.name, ui.password, {
          success: function( response ) {
            $.albums.dialog.loginDialog( "close" );
          },
          error: function( status, error, reason ) {
            alert( "Error: " + error + ", " + reason );
          }
        });
      }
    });
  }
  
})(jQuery)
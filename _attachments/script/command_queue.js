(function(window) {

    function Commandable() {}
    Commandable.prototype.execute = function( data ){};
    
    function Queue( ops ) {
        this.options = ops || {};
        this.list = [];
        this.command;
        
        this.addCommand = function( command ) {
            var length = this.list.length;
            if( length > 0 ) {
                this.list[length-1].nextCommand = this;
            }
            this.list.push( command ); 
        }
    }
    var q = Queue.prototype = new Commandable();
    q.options = undefined;
    q.list = undefined;
    q.command = undefined;
    q.constructor = Queue;
    q.execute = function( data ) {
        if( this.list.length > 0 ) {
            this.command = this.list.shift();
            this.command.execute( data );
        }
        else {
            this.command = undefined;
            if( this.options.complete ) {
                this.options.complete();
            }
        }
    }
    
    function Command( target, args, ops ) {
        this.target = target;
        this.args = args || [];
        this.options = ops || {};
        this.nextCommand = undefined;
    }
    var c = Command.prototype = new Commandable();
    c.constructor = Command;
    c.getCommandOptions = function( options, nextCommand ) {
        var responder = {
            ops: options,
            success: function( response ) {
                if( options && options.success ) options.success( response );
                if( nextCommand ) {
                    nextCommand.execute( response );
                }
            },
            error: function( status, error, reason ) {
                if( options && options.error ) options.error( status, error, reason );
            }
        };
        return $.extend( {}, this.options, responder );
    }
    c.execute = function( data ) {
        this.args.push( this.getCommandOptions( this.options, this.nextCommand ) );
        this.target.apply( this, this.args );
    }

window.Queue = Queue;
window.Command = Command;

}(window));
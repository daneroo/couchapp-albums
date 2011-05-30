var AlbumEditPageController = function() {
	
	var editableAlbum;
	
	function handleEditPageViewHide()
	{
		$("#cancelButton").die( "click", handleCancelEdit );
		$("#cancelBackButton").die( "click" );
		$("#submitButton").die( "click" );
		editableAlbum = null;
		
		var docId = $("#albumform").data("identity");
		var pageCache =  $(document.getElementById("_show/album-edit/" + docId));
		pageCache.unbind( "pagehide", handleEditPageViewHide );
		pageCache.empty();
		pageCache.remove();
	}
	
	function handleEditView()
	{
		// Watch for bound hide of page to clear from cache.
		var docId = $("#albumform").data("identity");
		var albumPage = $(document.getElementById("_show/album-edit/" + docId));
		albumPage.bind( "pagehide", handleEditPageViewHide );
		
		storeUneditedDocument();
	}
	
	function navigateToAlbumPage( docId )
	{
		$.mobile.changePage( "_show/album/" + docId, "flip", true, true );
	}
	
	function storeUneditedDocument()
	{
		var artist = $("input#artistField").val();
		var album = $("input#titleField").val();
		var description = $("textarea#descriptionField").val();
		editableAlbum = {artist:artist, album:album, description:description};
	}
	
	function saveDocument( document )
	{
		$.albums.saveDocument( document, {	
			success: function( response )  {
				updateEditableAlbum( document );
				navigateToAlbumPage( document._id );
			},
			error: function( status, error, reason ) {
				alert( "Cannot save document: " + document._id + "\n" + reason );
			}
		});
	}
	
	function updateEditableAlbum( document )
	{
		editableAlbum.artist = document.artist;
		editableAlbum.album = document.album;
		editableAlbum.description = document.description;
	}
	
	function revertEdits()
	{
		$("input#artistField").val( editableAlbum.artist );
		$("input#titleField").val( editableAlbum.album );
		$("textarea#descriptionField").val( editableAlbum.description );
	}

	function handleCancelEdit()
	{
		revertEdits();
		var docId = $("#albumform").data("identity");
		navigateToAlbumPage( docId );
	}
	
	return {
		initialize: function() {
			$("#cancelButton").live( "click", handleCancelEdit );
			$("#cancelBackButton").live( "click", function( event ) {
				event.preventDefault();
				handleCancelEdit();
				return false;
			});
			$("#submitButton").live( "click", function( event ) {
				// [NOTE] Had to update index.html to have first page read #home.
				var docId = $("#albumform").data("identity");
				$db.openDoc( docId, {
					success: function( document ) {
						document.artist = $("input#artistField").val();
						document.title = $("input#titleField").val();
						document.description = $("textarea#descriptionField").val();
						saveDocument( document );
					},
					error: function() {
						alert( "Cannot open document: " + docId );
					}
				});
			});
			$("div[data-role='page']").live( "pageshow", function() {
				$("div[data-role='page']").die( "pageshow" );
				handleEditView();
			});
		}
	};
}();
	
function handleEditPageReady()
{
	AlbumEditPageController.initialize();
}
$().ready( handleEditPageReady )
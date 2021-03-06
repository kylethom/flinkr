
var apiKey = "94a39e9a3da039bb828e019363a07f18";
var breadCrumbList = [];
var breadCrumbId = [];

$(document).ready(function(){
	getInterestingPhotos();
	
	var windowHeight = $(window).height();
	var titleHeight = $('#title').outerHeight();
	var breadcrumbHeight = $('#breadcrumbs').outerHeight();
	var bodyHeight = windowHeight - titleHeight - breadcrumbHeight;
	$(document.body).css('height',bodyHeight);
});

$(window).resize(function(){
	resizeGroupResults();
})

function resizeGroupResults(){

	var groupWrapperHeight = $(window).height();
	var titleHeight = $('#title').outerHeight(true);
	var breadcrumbHeight = $('#breadcrumbs-wrapper').outerHeight(true);
	var photoTitleHeight = $('#photo-groups-title h2').outerHeight(true);

	groupWrapperHeight = groupWrapperHeight - titleHeight - breadcrumbHeight - photoTitleHeight - 25;
	$('#photo-groups-wrapper').css('height', groupWrapperHeight);
}

function getInterestingPhotos(){
	$('#results').empty();
	$('#results').css('opacity', 1);
	$('#groups').css('opacity', 0);
	$('#groups').css('display','none');
	$('#results').css('display', 'block');
	$.get( "https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key="+ apiKey + "&per_page=50&format=json&nojsoncallback=1", function( data ) {
		$.each(data.photos.photo, function(i){
			var imgUrl = "https://farm" + data.photos.photo[i].farm + ".staticflickr.com/" + data.photos.photo[i].server + "/" + data.photos.photo[i].id + "_" + data.photos.photo[i].secret + ".jpg";			
			$('#results').append( "<div class='containImg' id="+ data.photos.photo[i].id +" data-owner="+ data.photos.photo[i].owner +"><span class='helper'></span><img class='interestingImg' src="+ imgUrl +"></img></div>" );
		});
	});
}

function getPhotoGroups(imgId,imgUrl,addCrumb,imgOwner){
	$.get("https://api.flickr.com/services/rest/?method=flickr.photos.getAllContexts&api_key="+ apiKey +"&photo_id="+imgId+"&format=json&nojsoncallback=1", function(data){
		if(data.pool){
			resizeGroupResults();
			$('#selected-photo').empty();
			$('#photo-groups').empty();
			$('#photo-groups-title').empty();
			$('#photo-groups-wrapper h2').remove();
			$('#groups').css('display','block');
			$('#groups').css('opacity',1);
			var imgLink = "https://www.flickr.com/photos/"+ imgOwner +"/"+imgId;
			$('#photo-groups-title').append("<a href="+ imgLink +" target='_blank'><p>View Photo on Flickr</p></a>");
			$('#selected-photo').append("<img src="+ imgUrl +"></img>");
			if(data.pool.length > 1){
				$('#photo-groups-title').prepend("<h2>This photo is in "+ data.pool.length +" groups</h2>");
			}else{
				$('#photo-groups-title').prepend("<h2>This photo is in " + data.pool.length +" group</h2>");
			}

			resizeGroupResults();

			$.each(data.pool, function(i){
				$.get("https://api.flickr.com/services/rest/?method=flickr.groups.getInfo&api_key="+ apiKey +"&group_id="+ data.pool[i].id +"&format=json&nojsoncallback=1", function(groupData){
					var groupPhotoUrl = "http://farm"+ groupData.group.iconfarm +".staticflickr.com/"+ groupData.group.iconserver+"/buddyicons/"+ groupData.group.id +".jpg";
					var groupName = data.pool[i].title;
					$('#photo-groups').append("<div id="+ data.pool[i].id +" name='"+ groupName +"' class='groupPhoto'><div class='circular' style='background-image:url("+ groupPhotoUrl +");'><img src='img/arrow-icon-overlay.png'></img></div><h3>"+ groupName +"</h3><span style='clear:both'></span></div>");
				});
				showPhotoGroups();
			});
			if(addCrumb){
				addBreadCrumb(imgId, "img", imgUrl, imgOwner);
				renderBreadCrumbs();
			}
		}else{
			$('#results #'+imgId).append("<div class='photo-overlay'><div class='no-photos'><p>NO</br>RESULTS</p></div></div>");
		}
	});
}

function showPhotoGroups(){
	$('#results').css('opacity', 0);
	$('#groups').css('opacity', 1);
	$('#results').css('display', 'none');
}

function getGroupPhotos(groupId, groupName){
	$('#selected-photo').empty();
	$('#photo-groups').empty();
	$('#results').empty();	
	$('#results').append('<h2>Photos in <i>'+ groupName +'</i></h2>');
	$('#results').css('display','block');
	$('#groups').css('display','none');
	$('#results').css('opacity',1);
	$.get("https://api.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos&api_key="+ apiKey +"&group_id="+ groupId +"&per_page=25&format=json&nojsoncallback=1", function(groupPhotosData){
		$.each(groupPhotosData.photos.photo, function(index){
			var imgUrl = "https://farm" + groupPhotosData.photos.photo[index].farm + ".staticflickr.com/" + groupPhotosData.photos.photo[index].server + "/" + groupPhotosData.photos.photo[index].id + "_" + groupPhotosData.photos.photo[index].secret + ".jpg";			
			$('#results').append( "<div class='containImg' id="+ groupPhotosData.photos.photo[index].id+ " data-owner="+ groupPhotosData.photos.photo[index].owner +" ><img class='interestingImg' src="+ imgUrl +"></img></div>" );
		})
	});
}

//Clears all breadcrumbs
function returnToRoot(){
	getInterestingPhotos();
	breadCrumbList = [];
	breadCrumbId = [];
	renderBreadCrumbs();
	$('#breadcrumbs-wrapper').css('padding','0px 0px');
	$('#intro').css('display','block');
	$('#intro').empty();
	$('#intro').append("<p>Select an interesting photo to continue.</p>");
}

function addBreadCrumb(id,type,content,imgOwner){
	var flickrId = id;
	var elementId = id.replace(/[^a-z0-9\s]/gi, '');
	var duplicateIdCount = 0;
	var elementId;

	//Count duplicate breadcrumbs
	$.each(breadCrumbId, function(i){
		if( breadCrumbId[i].slice(0,-2) == elementId){
			duplicateIdCount ++;
		}
	});
	elementId = elementId + "-" + duplicateIdCount;

	//Add breadcrumb to array
	if(type == 'img'){
		var crumb = $("<div class='circular' id="+ elementId +" data-flickrId=" + flickrId + " data-owner="+ imgOwner +" style='background-image:url("+ content +")'></div>");
	}else if(type == 'group'){
		var parsedName = content.replace(/ /g, '_');
		var crumb = $("<p id="+ elementId +" class='group-crumb' data-flickrId="+ flickrId +" name="+ parsedName +" >"+ content +"</p>");
	}
	breadCrumbList.push(crumb);
	breadCrumbId.push(elementId);
}

function renderBreadCrumbs(){
	$('#breadcrumbs').empty();
	$('#intro').css('display','none');
	$('#breadcrumbs-root').css('opacity',1)
	$('#breadcrumbs-wrapper').css('padding','20px 0px');
	
	$.each(breadCrumbList, function(i){
		$('#breadcrumbs').append("<img src='img/arrow-icon.png'>");
		$('#breadcrumbs').append( breadCrumbList[i]);
	});

	$('#breadcrumbs').append("<div style='width:20px; height:1px; float: left;'></div>");

	
	//scroll to end of breadcrumbs
	var breadcrumbListWidth = 0;	
	$('#breadcrumbs').children().each(function(){
		breadcrumbListWidth = breadcrumbListWidth + $(this).outerWidth(true);
	});
	breadcrumbListWidth = breadcrumbListWidth;
	$('#breadcrumbs').css('width',breadcrumbListWidth + 50);
	$('#breadcrumbs-wrapper').animate({scrollLeft: breadcrumbListWidth},800);
}

function removeBreadCrumb(id){
	var elementId = id;
	var removeAfter;

	$.each(breadCrumbList, function(i){
		if(breadCrumbList[i].attr('id') == elementId){
			removeAfter = i+1;
		}
	});
	breadCrumbList = breadCrumbList.splice(0, removeAfter);	
}

//Click on results image
$(document).on('click', ".interestingImg", function() {
	var imgId = $(this).parent().attr("id");
	var imgUrl = $(this).attr("src");
	var imgOwner = $(this).parent().attr('data-owner');
	getPhotoGroups(imgId, imgUrl,true,imgOwner);
});

//Click on results group
$(document).on('click','.groupPhoto', function(){
	var groupId = $(this).attr('id');
	var groupName = $(this).attr('name');
	getGroupPhotos(groupId, groupName);

	addBreadCrumb(groupId, "group", groupName);
	renderBreadCrumbs();
})

//Click on Breadcrumb Group
$(document).on('click', '#breadcrumbs p', function(){
	var flickrId = $(this).attr('data-flickrId');
	var crumbGroupName = $(this).attr('name');
	crumbGroupName = crumbGroupName.replace(/_/g, ' ');
	getGroupPhotos(flickrId, crumbGroupName);

	var crumbId = $(this).attr('id');
	removeBreadCrumb(crumbId);
	renderBreadCrumbs();
});

//Click on Breadcrumb Image
$(document).on('click','#breadcrumbs .circular', function(){
	var flickrId = $(this).attr('data-flickrId');
	var crumbImageUrl = $(this).css('background-image');
	var imgOwner = $(this).attr('data-owner');
	crumbImageUrl = crumbImageUrl.replace( /url\(|\)/g, '' );
	getPhotoGroups(flickrId, crumbImageUrl,false,imgOwner);
	
	var crumbId = $(this).attr('id');
	removeBreadCrumb(crumbId);
	renderBreadCrumbs();
});

//Click on breadcrumb root
$(document).on('click','#breadcrumbs-root', function(){
	returnToRoot();
})

//Click on logo
$('#title img').click(function(){
	returnToRoot();
})

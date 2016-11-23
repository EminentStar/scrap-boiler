$(document).ready(function(){
    $('#button1').click(function(){
        var search = $('#search').val();
        ajaxGet('http://52.78.235.245:8000/scrap?url=' + search, function(){
 
        });
    });
    $('#button2').click(function(){
        var search = $('#search').val();
        ajaxGet('http://52.78.235.245:8000/expire?url=' + search, function(){

        });
    });
    
    function ajaxGet(url, callback){
        $.ajax({
            url: url,
            type: "GET",
            success: callback
        });
    }

});


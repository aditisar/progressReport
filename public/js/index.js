function createSession(){
    var url= "omelet/";
    $.ajax({
        type: 'GET',
        url: url,
        success: function(result) {
            $('#all').html(result);
        }
    });
};


$(document).ready(function() {
    $('#indexSubmitButton').on("click", createSession);
});


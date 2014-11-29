function createSession(){
    var url= "setGoal";
    $.ajax({
        type: 'GET',
        url: url,
        // success: function(result) {
        //     $('#all').html(result);
        // }
    });
};


$(document).ready(function() {
    $('#indexSubmitButton').on("click", createSession);
});


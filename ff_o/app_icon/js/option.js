$(function() {
    $('input[name="id"]').val(localStorage['id'] || "");
    $('form').on('submit', function(e) {
        e.preventDefault();
        localStorage['id'] = $('input[name="id"]').val();
        $('input[type="submit"]').val("Saved!");
        setTimeout(function() {
            $('input[type="submit"]').val("Save");
        }, 1000);
    });
});
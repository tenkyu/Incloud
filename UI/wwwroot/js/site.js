(function () {
    'use strict';
    window.addEventListener('load', function () {
        var form = document.getElementById('bookForm');
        form.addEventListener('submit', function (event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    }, false);
})();

$(document).ready(function () {

    var hasTimer = false;
    // Init timer start
    $('.start-timer-btn').on('click', function() {
        hasTimer = true;
        $('.timer').timer({
            editable: true
        });
        $(this).addClass('d-none');
        $('.pause-timer-btn, .remove-timer-btn').removeClass('d-none');
    });

// Init timer resume
    $('.resume-timer-btn').on('click', function() {
        $('.timer').timer('resume');
        $(this).addClass('d-none');
        $('.pause-timer-btn, .remove-timer-btn').removeClass('d-none');
    });


// Init timer pause
    $('.pause-timer-btn').on('click', function() {
        $('.timer').timer('pause');
        $(this).addClass('d-none');
        $('.resume-timer-btn').removeClass('d-none');
    });

// Remove timer
    $('.remove-timer-btn').on('click', function() {
        hasTimer = false;
        $('.timer').timer('remove');
        $(this).addClass('d-none');
        $('.start-timer-btn').removeClass('d-none');
        $('.pause-timer-btn, .resume-timer-btn').addClass('d-none');
    });

// Additional focus event for this demo
    $('.timer').on('focus', function() {
        if(hasTimer) {
            $('.pause-timer-btn').addClass('d-none');
            $('.resume-timer-btn').removeClass('d-none');
        }
    });

// Additional blur event for this demo
    $('.timer').on('blur', function() {
        if(hasTimer) {
            $('.pause-timer-btn').removeClass('d-none');
            $('.resume-timer-btn').addClass('d-none');
        }
    });

    $('#startDate').datetimepicker();
    $('#finishDate').datetimepicker({
        useCurrent: false //Important! See issue #1075
    });
    $("#startDate").on("dp.change", function (e) {
        $('#finishDate').data("DateTimePicker").minDate(e.date);
    });
    $("#finishDate").on("dp.change", function (e) {
        $('#startDate').data("DateTimePicker").maxDate(e.date);
    });

    $('#example').DataTable({
        "ajax": "/objects.txt",
        "columns": [
            { "data": "name" },
            { "data": "position" },
            { "data": "office" },
            { "data": "extn" },
            { "data": "start_date" },
            { "data": "salary" }
        ]
    });

});
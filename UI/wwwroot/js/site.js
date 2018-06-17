var currentTimer = {};
var hasTimer = false;
var table;

$(document).ready(function () {

    // Init timer start
    $('.start-timer-btn').on('click', function () {
        $('.timer').timer({
            editable: true
        });
        currentTimer = {};
        currentTimer.StartDate = moment().toISOString();
        timerOnStarted();
    });

    // Init timer resume
    $('.resume-timer-btn').on('click', function () {
        $('.timer').timer('resume');
        $(this).addClass('d-none');
        $('.pause-timer-btn, .remove-timer-btn, .finish-timer-btn').removeClass('d-none');
    });


    // Init timer pause
    $('.pause-timer-btn').on('click', function () {
        $('.timer').timer('pause');
        $(this).addClass('d-none');
        $('.resume-timer-btn').removeClass('d-none');
    });

    // Remove timer
    $('.remove-timer-btn').on('click', function () {
        resetTimer();
    });

    // Finish timer
    $('.finish-timer-btn').on('click', function () {
        currentTimer.TotalSeconds = $('.timer').data('seconds');
        currentTimer.FinishDate = moment().toISOString();
        saveTimer(currentTimer);
    });

    // Additional focus event for this demo
    $('.timer').on('focus', function () {
        if (hasTimer) {
            $('.pause-timer-btn').addClass('d-none');
            $('.resume-timer-btn').removeClass('d-none');
        }
    });

    // Additional blur event for this demo
    $('.timer').on('blur', function () {
        if (hasTimer) {
            $('.pause-timer-btn').removeClass('d-none');
            $('.resume-timer-btn').addClass('d-none');
        }
    });

    $('#StartDate').datetimepicker();
    $('#FinishDate').datetimepicker({
        useCurrent: false //Important! See issue #1075
    });
    $('#StartDate').data("DateTimePicker").maxDate(moment());

    $("#StartDate").on("dp.change", function (e) {
        $('#FinishDate').data("DateTimePicker").minDate(e.date);
    });
    $("#FinishDate").on("dp.change", function (e) {
        $('#StartDate').data("DateTimePicker").maxDate(e.date);
    });

    table = $('#example').DataTable({
        serverSide: true,
        ajax: "/Home/PageData",
        bLengthChange: false,
        processing: true,
        searching: true,
        paging: true,
        "order": [[0, "desc"]],
        columns: [
            {
                data: "id"
            },
            {
                data: "description"
            },
            {
                data: "startDate",
                "sClass": "text-nowrap",
                render: function (data, type, row, meta) {
                    return moment(data).format('DD.MM.YYYY HH:mm');
                }
            },
            {
                data: "finishDate",
                "sClass": "text-nowrap",
                render: function (data, type, row, meta) {
                    if (data) {
                        return moment(data).format('DD.MM.YYYY HH:mm');
                    }

                    return null;
                }
            },
            {
                data: "totalSeconds",
                render: function (data, type, row, meta) {
                    return moment.duration(data, 'seconds').humanize();
                }
            }
        ]
    });

    $("#bookForm").submit(function (e) {

        var formIsValid = this.checkValidity();
        if (formIsValid === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.classList.add('was-validated');

        e.preventDefault(); // avoid to execute the actual submit of the form

        if (formIsValid) {
            var entity = $("#bookForm").serializeJSON();

            if (entity.StartDate) {
                entity.StartDate = moment(entity.StartDate).toISOString();
            } else {
                entity.StartDate = null;
            }

            if (entity.FinishDate) {
                entity.FinishDate = moment(entity.FinishDate).toISOString();
            } else {
                entity.FinishDate = null;
            }

            if (entity.FinishDate) {
                saveTimer(entity);
            } else {
                currentTimer = entity;
                if (entity.StartDate) {
                    $('.timer').timer({
                        editable: true,
                        seconds: moment.duration(moment().diff(moment(entity.StartDate))).asSeconds()
                    });
                } else {
                    $('.timer').timer({
                        editable: true
                    });    
                }
                
                timerOnStarted();
            }
        }
    });
});

function saveTimer(entity) {
    $.ajax({
        url: '/Home/Save',
        type: 'POST',
        data: entity,
        dataType: "json",
        success: function (result) {
            table.ajax.reload();
            $("#bookForm")[0].reset();
            $('#StartDate').data("DateTimePicker").maxDate(moment());
            resetTimer();
        }
    });
}

function timerOnStarted() {
    hasTimer = true;
    $('.start-timer-btn').addClass('d-none');
    $('.pause-timer-btn, .remove-timer-btn, .finish-timer-btn').removeClass('d-none');
}

function resetTimer() {
    hasTimer = false;
    currentTimer = {};
    $('.timer').timer('remove');
    $('.remove-timer-btn').addClass('d-none');
    $('.start-timer-btn').removeClass('d-none');
    $('.pause-timer-btn, .resume-timer-btn, .finish-timer-btn').addClass('d-none');
}
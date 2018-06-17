## About

This trial project for Incloud Company, see the [Remote Assignment](https://github.com/tenkyu/Incloud/raw/master/remote_assignment.pdf)

## Installation
Make sure that .Net Core 2.1 is installed on your system. Clone the project and open with Visual Studio 2017 or any .Net runtime editor, just run it.

## Explanation
Please watch my video

[![Incloud trial project](http://img.youtube.com/vi/8p-99W3BRxc/0.jpg)](http://www.youtube.com/watch?v=8p-99W3BRxc)

I use Bootstrap 4 for responsive design, and use momentjs for handling time in frontend side. There are some several components for UI design from Bower, please see the bower.json

I prefer Microsoft .Net Core for backend because it works all platforms and ultra fast. I used Microsoft SQL Server Express Edition which can be downloaded here https://www.microsoft.com/tr-tr/sql-server/sql-server-editions-express.

I spent two days in total for 3 hours a day for this demo. If I had more time, i could be add offline working feature. Because when you close the window, it stops tracking time.

For backend side i use MVC design pattern, please see the comments
In Controllers\HomeController.cs

```csharp
public class HomeController : Controller
{
    private readonly EntityDbContext _context;

    //Dependency Injection
    public HomeController(EntityDbContext context)
    {
        _context = context;
    }

    //Display view
    public IActionResult Index()
    {
        return View();
    }

    //Save data to DB
    [HttpPost]
    public IActionResult Save(UserTimer entity)
    {
        //Validation for UserTimer 
        if (!ModelState.IsValid || entity == null) return BadRequest();

        //Calculate total seconds if it is empty
        if (entity.TotalSeconds == 0 && entity.FinishDate.HasValue)
        {
            entity.TotalSeconds = (int)entity.FinishDate.Value.Subtract(entity.StartDate).TotalSeconds;
        }

        //Save to DB
        _context.UserTimers.Add(entity);
        _context.SaveChanges();

        return Ok(entity);
    }

    //Get olds records to View with filter and paging option
    public async Task<IActionResult> PageData(IDataTablesRequest request)
    {
        // Nothing important here. Just creates some mock data.
        var data = _context.UserTimers;

        // Global filtering.
        // Filter is being manually applied due to in-memmory (IEnumerable) data.
        // If you want something rather easier, check IEnumerableExtensions Sample.
        var filteredData = string.IsNullOrWhiteSpace(request.Search.Value)
            ? data
            : data.Where(e => e.Description.Contains(request.Search.Value));

        // Paging filtered data.
        // Paging is rather manual due to in-memmory (IEnumerable) data.

        var orderColums = request.Columns.Where(x => x.Sort != null);

        filteredData = filteredData.OrderBy(orderColums);

        var dataPage = request.Length > -1 ? filteredData.Skip(request.Start).Take(request.Length) : filteredData;

        // Response creation. To create your response you need to reference your request, to avoid
        // request/response tampering and to ensure response will be correctly created.
        var response = DataTablesResponse.Create(request, data.Count(), filteredData.Count(), await dataPage.ToListAsync());

        // Easier way is to return a new 'DataTablesJsonResult', which will automatically convert your
        // response to a json-compatible content, so DataTables can read it when received.
        return new DataTablesJsonResult(response, true);
    }

    //Global error handling
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
```

For frontend side, please see the comments
js\site.js.

```javascript
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
```

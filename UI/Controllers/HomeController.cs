using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using DataTables.AspNet.AspNetCore;
using DataTables.AspNet.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UI.Models;

namespace UI.Controllers
{
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
}

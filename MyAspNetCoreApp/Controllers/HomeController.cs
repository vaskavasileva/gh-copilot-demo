using Microsoft.AspNetCore.Mvc;

namespace MyAspNetCoreApp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
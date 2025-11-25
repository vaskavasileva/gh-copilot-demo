using Microsoft.AspNetCore.Mvc;

namespace MyAspNetCoreApp.Controllers
{
    public class UsersController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
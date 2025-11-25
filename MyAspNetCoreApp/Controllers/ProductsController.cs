using Microsoft.AspNetCore.Mvc;

namespace MyAspNetCoreApp.Controllers
{
    public class ProductsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
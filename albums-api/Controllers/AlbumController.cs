using albums_api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Text;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace albums_api.Controllers
{
    [Route("albums")]
    [ApiController]
    public class AlbumController : ControllerBase
    {
        // GET: api/album
        // Supports optional query params: ?sort={title|artist|id}&dir={asc|desc}
        [HttpGet]
        public IActionResult Get([FromQuery] string? sort = null, [FromQuery] string? dir = "asc")
        {
            var albums = Album.GetAll().AsEnumerable();

            if (!string.IsNullOrWhiteSpace(sort))
            {
                var key = sort.Trim().ToLowerInvariant();
                var direction = (dir ?? "asc").Trim().ToLowerInvariant();

                albums = key switch
                {
                    "title" or "name" => direction == "desc" ? albums.OrderByDescending(a => a.Title) : albums.OrderBy(a => a.Title),
                    "artist" => direction == "desc" ? albums.OrderByDescending(a => a.Artist) : albums.OrderBy(a => a.Artist),
                    "id" => direction == "desc" ? albums.OrderByDescending(a => a.Id) : albums.OrderBy(a => a.Id),
                    _ => albums
                };
            }

            return Ok(albums);
        }

        // GET api/<AlbumController>/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var albums = Album.GetAll();
            var album = albums.Find(a => a.Id == id);
            if (album == null)
            {
                return NotFound();
            }

            return Ok(album);
        }

    }
}

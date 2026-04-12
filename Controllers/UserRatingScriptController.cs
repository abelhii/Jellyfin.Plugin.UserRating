using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("UserRating")]
public class UserRatingScriptController : ControllerBase
{
    [HttpGet("plugin.js")]
    public IActionResult GetScript()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = "Jellyfin.Plugin.UserRatings.Web.userrating.js";
        var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null) return NotFound();
        return File(stream, "application/javascript");
    }
}
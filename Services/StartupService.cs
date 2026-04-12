// Services/StartupService.cs
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediaBrowser.Controller;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class StartupService : IHostedService
{
    private readonly IServerApplicationPaths _appPaths;
    private readonly ILogger<StartupService> _logger;

    public StartupService(IServerApplicationPaths appPaths, ILogger<StartupService> logger)
    {
        _appPaths = appPaths;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Phase 1: clean any previous direct injection (idempotent)
        CleanDirectInjection();

        // Phase 2: try File Transformation, fall back to direct injection
        var fileTransformationAssembly = AssemblyLoadContext.All
            .SelectMany(x => x.Assemblies)
            .FirstOrDefault(x => x.FullName?.Contains(".FileTransformation") ?? false);

        if (fileTransformationAssembly != null)
        {
            var pluginInterfaceType = fileTransformationAssembly
                .GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");

            if (pluginInterfaceType != null)
            {
                var payload = new
                {
                    id = Plugin.Instance!.Id.ToString(),
                    fileNamePattern = "index.html",
                    callbackAssembly = GetType().Assembly.FullName,
                    callbackClass = typeof(TransformationPatches).FullName,
                    callbackMethod = nameof(TransformationPatches.IndexHtml)
                };

                // File Transformation expects the payload as a serialized JObject
                // but since we can't reference Newtonsoft directly, pass anonymously
                pluginInterfaceType
                    .GetMethod("RegisterTransformation")
                    ?.Invoke(null, new object?[] { payload });

                _logger.LogInformation("[UserRating] Registered with File Transformation plugin");
                return Task.CompletedTask;
            }
        }

        // Fallback: patch index.html directly
        _logger.LogWarning("[UserRating] File Transformation not found, falling back to direct injection");
        InjectDirect();

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private void CleanDirectInjection()
    {
        var indexPath = GetIndexHtmlPath();
        if (!File.Exists(indexPath)) return;

        var contents = File.ReadAllText(indexPath);
        var start = "<!-- BEGIN UserRating Plugin -->";
        var end = "<!-- END UserRating Plugin -->";
        var startIdx = contents.IndexOf(start, StringComparison.Ordinal);
        var endIdx = contents.IndexOf(end, StringComparison.Ordinal);

        if (startIdx >= 0 && endIdx >= 0)
        {
            var cleaned = contents.Remove(startIdx, (endIdx + end.Length) - startIdx);
            File.WriteAllText(indexPath, cleaned);
        }
    }

    private void InjectDirect()
    {
        var indexPath = GetIndexHtmlPath();
        if (!File.Exists(indexPath)) return;

        var contents = File.ReadAllText(indexPath);
        if (contents.Contains("UserRating/plugin.js")) return; // already injected

        var block = "\n<!-- BEGIN UserRating Plugin -->" +
                    "\n<script defer src=\"/UserRating/plugin.js\"></script>" +
                    "\n<!-- END UserRating Plugin -->\n";

        File.WriteAllText(indexPath, contents.Replace("</body>", block + "</body>",
            StringComparison.OrdinalIgnoreCase));
    }

    private string GetIndexHtmlPath()
    {
        // Standard Jellyfin web root locations
        var candidates = new[]
        {
            Path.Combine(_appPaths.WebPath, "index.html"),
            "/usr/share/jellyfin/web/index.html",
        };
        return candidates.FirstOrDefault(File.Exists) ?? candidates[0];
    }
}
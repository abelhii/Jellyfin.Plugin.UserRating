using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.UserRatings.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.UserRatings
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        private readonly ILogger<Plugin> _logger;

        public override string Name => "User Ratings";

        public override Guid Id => Guid.Parse("b8c5d3e7-4f6a-8b9c-1d2e-3f4a5b6c7d8e");

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer, ILogger<Plugin> logger)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            _logger = logger;

            // Inject ratings script into index.html
            if (!string.IsNullOrWhiteSpace(applicationPaths.WebPath))
            {
                var indexFile = Path.Combine(applicationPaths.WebPath, "index.html");
                if (File.Exists(indexFile))
                {
                    string indexContents = File.ReadAllText(indexFile);

                    // Regex to remove old scripts - catch both script tags and link tags with plugin="UserRatings"
                    string scriptReplace = "<(script|link)[^>]*plugin=\"UserRatings\"[^>]*>(?:</script>)?";
                    string[] scripts = new[]
                    {
                        "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=api.js\"></script>",
                        "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=ui.js\"></script>",
                        "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=container-detector.js\"></script>",
                        "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=detail-page-injector.js\"></script>",
                        "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=home-page-ratings.js\"></script>",
                        "<link plugin=\"UserRatings\" rel=\"stylesheet\" href=\"/web/ConfigurationPage?name=styles.css\">",
                        "<script plugin=\"UserRatings\" src=\"/web/ConfigurationPage?name=main.js\"></script>"
                    };

                    // Check if any scripts are already injected
                    bool alreadyInjected = false;
                    foreach (var script in scripts)
                    {
                        if (indexContents.Contains(script))
                        {
                            alreadyInjected = true;
                            break;
                        }
                    }

                    if (!alreadyInjected)
                    {
                        _logger.LogInformation("Injecting User Ratings plugin into {indexFile}", indexFile);

                        // Remove old scripts (both old ratings.js and new plugin format)
                        indexContents = Regex.Replace(indexContents, scriptReplace, "", RegexOptions.Singleline);
                        // Also explicitly remove ratings.js if it exists with any format
                        indexContents = Regex.Replace(indexContents, "<script[^>]*ratings\\.js[^>]*>(?:</script>)?", "", RegexOptions.Singleline);

                        // Insert scripts before closing body tag
                        int bodyClosing = indexContents.LastIndexOf("</body>");
                        if (bodyClosing != -1)
                        {
                            string scriptElements = string.Join("\n    ", scripts);
                            indexContents = indexContents.Insert(bodyClosing, "    " + scriptElements + "\n");

                            try
                            {
                                File.WriteAllText(indexFile, indexContents);
                                _logger.LogInformation("Successfully injected User Ratings plugin");
                            }
                            catch (Exception e)
                            {
                                _logger.LogError(e, "Error writing to {indexFile}", indexFile);
                            }
                        }
                    }
                    else
                    {
                        _logger.LogInformation("User Ratings plugin already injected");
                    }
                }
            }
        }

        public static Plugin? Instance { get; private set; }

        public IEnumerable<PluginPageInfo> GetPages()
        {
            return new[]
            {
                new PluginPageInfo
                {
                    Name = this.Name,
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.configPage.html"
                },
                new PluginPageInfo
                {
                    Name = "api.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.api.js"
                },
                new PluginPageInfo
                {
                    Name = "ui.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.ui.js"
                },
                new PluginPageInfo
                {
                    Name = "container-detector.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.container-detector.js"
                },
                new PluginPageInfo
                {
                    Name = "detail-page-injector.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.detail-page-injector.js"
                },
                new PluginPageInfo
                {
                    Name = "home-page-ratings.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.home-page-ratings.js"
                },
                new PluginPageInfo
                {
                    Name = "styles.css",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.styles.css"
                },
                new PluginPageInfo
                {
                    Name = "main.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.main.js"
                }
            };
        }
    }
}


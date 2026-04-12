using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading;
using System.Threading.Tasks;
using Jellyfin.Plugin.UserRatings.Helpers;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Jellyfin.Plugin.UserRatings.Services
{
    public class StartupService : IHostedService
    {
        private readonly ILogger<StartupService> _logger;

        public StartupService(ILogger<StartupService> logger)
        {
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("[UserRating] StartupService running, registering file transformations.");

            var payloads = new List<JObject>();

            var payload = new JObject();
            // Use a unique GUID for your plugin - generate one and keep it fixed
            payload.Add("id", "d8d77dfd-f6e6-41d2-8240-f2394561c227");
            payload.Add("fileNamePattern", "index.html");
            payload.Add("callbackAssembly", GetType().Assembly.FullName);
            payload.Add("callbackClass", typeof(TransformationPatches).FullName);
            payload.Add("callbackMethod", nameof(TransformationPatches.IndexHtml));
            payloads.Add(payload);

            // Find File Transformation plugin assembly via reflection
            Assembly? fileTransformationAssembly = null;
            foreach (var ctx in AssemblyLoadContext.All)
            {
                foreach (var asm in ctx.Assemblies)
                {
                    if (asm.FullName?.Contains(".FileTransformation") ?? false)
                    {
                        fileTransformationAssembly = asm;
                        break;
                    }
                }
                if (fileTransformationAssembly != null) break;
            }

            if (fileTransformationAssembly == null)
            {
                _logger.LogWarning("[UserRating] File Transformation plugin not found. Script will not be injected.");
                return Task.CompletedTask;
            }

            var pluginInterfaceType = fileTransformationAssembly
                .GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");

            if (pluginInterfaceType == null)
            {
                _logger.LogWarning("[UserRating] Could not find PluginInterface type in File Transformation assembly.");
                return Task.CompletedTask;
            }

            var registerMethod = pluginInterfaceType.GetMethod("RegisterTransformation");

            foreach (var p in payloads)
            {
                registerMethod?.Invoke(null, new object?[] { p });
            }

            _logger.LogInformation("[UserRating] Successfully registered transformation with File Transformation plugin.");

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
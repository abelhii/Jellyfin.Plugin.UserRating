using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.UserRatings.Model;

namespace Jellyfin.Plugin.UserRatings.Helpers
{
    public static class TransformationPatches
    {
        public static string IndexHtml(PatchRequestPayload payload)
        {
            // Load the embedded JS file
            Stream stream = Assembly.GetExecutingAssembly()
                .GetManifestResourceStream(
                    $"{typeof(Plugin).Namespace}.Web.userrating.js")!;

            using TextReader reader = new StreamReader(stream);

            // Inject it as an inline script just before </body>
            return Regex.Replace(
                payload.Contents!,
                "(<\\/body>)",
                $"<script defer>{reader.ReadToEnd()}</script>$1");
        }
    }
}
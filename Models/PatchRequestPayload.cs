using System.Text.Json.Serialization;

namespace Jellyfin.Plugin.UserRatings.Model
{
    public class PatchRequestPayload
    {
        [JsonPropertyName("contents")]
        public string? Contents { get; set; }
    }
}
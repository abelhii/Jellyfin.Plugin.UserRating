using System.Text.Json;

public static class TransformationPatches
{
    // File Transformation passes a JSON object: { "contents": "<html>..." }
    public static string IndexHtml(object payload)
    {
        var json = JsonSerializer.Serialize(payload);
        using var doc = JsonDocument.Parse(json);
        var contents = doc.RootElement.GetProperty("contents").GetString();

        if (string.IsNullOrEmpty(contents)) return contents ?? string.Empty;

        var scriptTag = "\n<script defer src=\"/UserRating/plugin.js\"></script>\n";
        return contents.Replace("</body>", scriptTag + "</body>",
                                StringComparison.OrdinalIgnoreCase);
    }
}
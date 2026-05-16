using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Pinpoint.Services;

public class ApiClient : IApiClient
{
    public const string DefaultBaseUrl = "https://location.beertengangs.com";

    readonly HttpClient _http;
    readonly AuthSession _session;
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public ApiClient(AuthSession session)
    {
        _session = session;
        _http = new HttpClient { BaseAddress = new Uri(DefaultBaseUrl), Timeout = TimeSpan.FromSeconds(20) };
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    void Authorize()
    {
        _http.DefaultRequestHeaders.Authorization = string.IsNullOrEmpty(_session.Token)
            ? null
            : new AuthenticationHeaderValue("Bearer", _session.Token);
    }

    record AuthDto([property: JsonPropertyName("token")] string Token,
                   [property: JsonPropertyName("user")]  UserDto User);
    record UserDto(string Id, string Email, string Name, string Initials, string Accent,
                   [property: JsonPropertyName("profile_image")] string? ProfileImage);

    static AuthResult ToResult(AuthDto d) =>
        new(d.Token, new AuthUser(d.User.Id, d.User.Email, d.User.Name, d.User.Initials, d.User.Accent, d.User.ProfileImage));

    public async Task<AuthResult> SignUpAsync(string email, string password, string name, CancellationToken ct = default)
    {
        Authorize();
        using var res = await _http.PostAsJsonAsync("/api/auth/signup", new { email, password, name }, Json, ct);
        await ThrowIfError(res);
        var dto = await res.Content.ReadFromJsonAsync<AuthDto>(Json, ct) ?? throw new InvalidOperationException("empty response");
        return ToResult(dto);
    }

    public async Task<AuthResult> SignInAsync(string email, string password, CancellationToken ct = default)
    {
        Authorize();
        using var res = await _http.PostAsJsonAsync("/api/auth/signin", new { email, password }, Json, ct);
        await ThrowIfError(res);
        var dto = await res.Content.ReadFromJsonAsync<AuthDto>(Json, ct) ?? throw new InvalidOperationException("empty response");
        return ToResult(dto);
    }

    public async Task<AuthUser?> GetMeAsync(CancellationToken ct = default)
    {
        Authorize();
        using var res = await _http.GetAsync("/api/me", ct);
        if (!res.IsSuccessStatusCode) return null;
        var u = await res.Content.ReadFromJsonAsync<UserDto>(Json, ct);
        return u is null ? null : new AuthUser(u.Id, u.Email, u.Name, u.Initials, u.Accent, u.ProfileImage);
    }

    record UrlDto([property: JsonPropertyName("url")] string Url);

    public async Task<string?> UploadProfileImageAsync(Stream image, string fileName, CancellationToken ct = default)
    {
        Authorize();
        using var form = new MultipartFormDataContent();
        var content = new StreamContent(image);
        content.Headers.ContentType = new MediaTypeHeaderValue(MimeFor(fileName));
        form.Add(content, "image", fileName);
        using var res = await _http.PostAsync("/api/me/profile-image", form, ct);
        await ThrowIfError(res);
        return (await res.Content.ReadFromJsonAsync<UrlDto>(Json, ct))?.Url;
    }

    public async Task<string?> UploadPictureAsync(Stream image, string fileName, string? caption,
                                                  double? lat, double? lng, CancellationToken ct = default)
    {
        Authorize();
        using var form = new MultipartFormDataContent();
        var content = new StreamContent(image);
        content.Headers.ContentType = new MediaTypeHeaderValue(MimeFor(fileName));
        form.Add(content, "image", fileName);
        if (caption is not null) form.Add(new StringContent(caption), "caption");
        if (lat.HasValue) form.Add(new StringContent(lat.Value.ToString(System.Globalization.CultureInfo.InvariantCulture)), "lat");
        if (lng.HasValue) form.Add(new StringContent(lng.Value.ToString(System.Globalization.CultureInfo.InvariantCulture)), "lng");
        using var res = await _http.PostAsync("/api/pictures", form, ct);
        await ThrowIfError(res);
        return (await res.Content.ReadFromJsonAsync<UrlDto>(Json, ct))?.Url;
    }

    public async Task PushLocationAsync(double lat, double lng, double? accuracy, DateTime ts, CancellationToken ct = default)
    {
        Authorize();
        var body = new { lat, lng, accuracy, ts = new DateTimeOffset(ts.ToUniversalTime()).ToUnixTimeMilliseconds() };
        using var res = await _http.PostAsJsonAsync("/api/location", body, Json, ct);
        if (!res.IsSuccessStatusCode)
            System.Diagnostics.Debug.WriteLine($"location push failed: {(int)res.StatusCode}");
    }

    record PersonRow(string Id, string Name, string Initials, string Accent,
                    [property: JsonPropertyName("profile_image")] string? ProfileImage,
                    [property: JsonPropertyName("last_lat")] double? LastLat,
                    [property: JsonPropertyName("last_lng")] double? LastLng,
                    [property: JsonPropertyName("last_ts")] long? LastTs);

    public async Task<IReadOnlyList<PersonDto>> GetPeopleAsync(CancellationToken ct = default)
    {
        Authorize();
        using var res = await _http.GetAsync("/api/people", ct);
        if (!res.IsSuccessStatusCode) return Array.Empty<PersonDto>();
        var rows = await res.Content.ReadFromJsonAsync<List<PersonRow>>(Json, ct) ?? new();
        return rows.ConvertAll(r => new PersonDto(r.Id, r.Name, r.Initials, r.Accent, r.ProfileImage,
                                                  r.LastLat, r.LastLng, r.LastTs));
    }

    static string MimeFor(string name)
    {
        var ext = Path.GetExtension(name).ToLowerInvariant();
        return ext switch { ".png" => "image/png", ".webp" => "image/webp", ".heic" => "image/heic", _ => "image/jpeg" };
    }

    static async Task ThrowIfError(HttpResponseMessage res)
    {
        if (res.IsSuccessStatusCode) return;
        var body = await res.Content.ReadAsStringAsync();
        throw new ApiException((int)res.StatusCode, body);
    }
}

public class ApiException : Exception
{
    public int Status { get; }
    public string Body { get; }
    public ApiException(int status, string body) : base($"HTTP {status}: {body}") { Status = status; Body = body; }
}

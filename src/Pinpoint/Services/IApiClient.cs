namespace Pinpoint.Services;

public record AuthUser(string Id, string Email, string Name, string Initials, string Accent, string? ProfileImage);
public record AuthResult(string Token, AuthUser User);
public record PersonDto(string Id, string Name, string Initials, string Accent, string? ProfileImage,
                       double? LastLat, double? LastLng, long? LastTs);

public interface IApiClient
{
    Task<AuthResult> SignUpAsync(string email, string password, string name, CancellationToken ct = default);
    Task<AuthResult> SignInAsync(string email, string password, CancellationToken ct = default);
    Task<AuthUser?> GetMeAsync(CancellationToken ct = default);
    Task<string?> UploadProfileImageAsync(Stream image, string fileName, CancellationToken ct = default);
    Task<string?> UploadPictureAsync(Stream image, string fileName, string? caption,
                                     double? lat, double? lng, CancellationToken ct = default);
    Task PushLocationAsync(double lat, double lng, double? accuracy, DateTime ts, CancellationToken ct = default);
    Task<IReadOnlyList<PersonDto>> GetPeopleAsync(CancellationToken ct = default);
}

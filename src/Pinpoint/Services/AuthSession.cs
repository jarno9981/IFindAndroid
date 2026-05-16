namespace Pinpoint.Services;

public class AuthSession
{
    const string TokenKey = "pinpoint.token";
    const string UserIdKey = "pinpoint.userid";
    const string UserNameKey = "pinpoint.username";
    const string UserEmailKey = "pinpoint.useremail";
    const string UserInitialsKey = "pinpoint.userinit";
    const string UserAccentKey = "pinpoint.useraccent";
    const string UserImageKey = "pinpoint.userimg";

    public string? Token { get; private set; }
    public AuthUser? User { get; private set; }
    public bool IsSignedIn => !string.IsNullOrWhiteSpace(Token);

    public event EventHandler? Changed;

    public async Task LoadAsync()
    {
        Token = await SecureStorage.Default.GetAsync(TokenKey);
        var id = await SecureStorage.Default.GetAsync(UserIdKey);
        if (Token is not null && id is not null)
        {
            User = new AuthUser(
                id,
                await SecureStorage.Default.GetAsync(UserEmailKey) ?? "",
                await SecureStorage.Default.GetAsync(UserNameKey) ?? "",
                await SecureStorage.Default.GetAsync(UserInitialsKey) ?? "YO",
                await SecureStorage.Default.GetAsync(UserAccentKey) ?? "#7CC4FF",
                await SecureStorage.Default.GetAsync(UserImageKey));
        }
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public async Task SetAsync(AuthResult r)
    {
        Token = r.Token;
        User = r.User;
        await SecureStorage.Default.SetAsync(TokenKey, r.Token);
        await SecureStorage.Default.SetAsync(UserIdKey, r.User.Id);
        await SecureStorage.Default.SetAsync(UserEmailKey, r.User.Email);
        await SecureStorage.Default.SetAsync(UserNameKey, r.User.Name);
        await SecureStorage.Default.SetAsync(UserInitialsKey, r.User.Initials);
        await SecureStorage.Default.SetAsync(UserAccentKey, r.User.Accent);
        if (r.User.ProfileImage is not null)
            await SecureStorage.Default.SetAsync(UserImageKey, r.User.ProfileImage);
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public Task SignOutAsync()
    {
        Token = null;
        User = null;
        SecureStorage.Default.RemoveAll();
        Changed?.Invoke(this, EventArgs.Empty);
        return Task.CompletedTask;
    }
}

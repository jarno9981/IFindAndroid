using Pinpoint.Services;

namespace Pinpoint.Views;

public partial class ShellPage : Shell
{
    readonly AuthSession _session;
    bool _initialised;

    public ShellPage(AuthSession session)
    {
        InitializeComponent();
        _session = session;
        _session.Changed += OnSessionChanged;
    }

    protected override async void OnHandlerChanged()
    {
        base.OnHandlerChanged();
        if (Handler is null || _initialised) return;
        _initialised = true;
        try { await _session.LoadAsync(); } catch { /* SecureStorage may be unavailable in some hosts */ }
        await ApplyRouteAsync();
    }

    void OnSessionChanged(object? sender, EventArgs e)
        => Dispatcher.Dispatch(async () => await ApplyRouteAsync());

    async Task ApplyRouteAsync()
    {
        var target = _session.IsSignedIn ? "//main" : "//auth/signin";
        var current = CurrentState?.Location?.OriginalString;
        if (current == target) return;
        try { await GoToAsync(target); } catch { /* shell not ready yet */ }
    }
}
